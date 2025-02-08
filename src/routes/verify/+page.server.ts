import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	userTable,
	sessionTable,
	verificationCodeTable,
	verifyUserSchema
} from '$lib/drizzle/schema';
import {
	createSession,
	deleteSessionTokenCookie,
	generateSessionToken,
	setSessionTokenCookie
} from '$lib/server/auth';
import * as m from '$lib/paraglide/messages.js';
import { generateVerificationCode, sendVerificationCode } from '$lib/server/verification';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(verifyUserSchema));

	return { form };
};

export const actions: Actions = {
	verify: async (event) => {
		const { request, cookies } = event;

		const form = await superValidate(request, zod(verifyUserSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { verificationCode: value } = form.data;

		const verificationCode = await db.query.verificationCodeTable.findFirst({
			where: eq(verificationCodeTable.value, value)
		});

		if (!verificationCode) {
			setError(form, 'verificationCode', '');

			return fail(400, { form });
		} else {
			const { expiresAt } = verificationCode;

			const now = new Date();

			if (expiresAt <= now) {
				setError(form, 'verificationCode', '');
				return fail(400, { form });
			}
		}

		const { userId } = verificationCode;

		await db.transaction(async (tx) => {
			await tx.update(userTable).set({ verifiedAt: new Date() }).where(eq(userTable.id, userId));

			await tx.delete(verificationCodeTable).where(eq(verificationCodeTable.userId, userId));

			await tx.delete(sessionTable).where(eq(sessionTable.userId, userId));
		});

		// "All sessions of a user should be invalidated when their email is verified."
		// - https://thecopenhagenbook.com/email-verification#email-verification-codes
		deleteSessionTokenCookie(event);

		// Start a session for the now-verified user, so that they don't have to login again.
		const sessionToken = generateSessionToken();

		const session = await createSession(sessionToken, userId);

		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect('/', { type: 'success', message: m.verified() }, cookies);
	},

	resend: async ({ locals, url: { pathname }, cookies }) => {
		if (!locals.user) {
			error(401); // Not Authorized
		}

		const user = await db.query.userTable.findFirst({ where: eq(userTable.id, locals.user.id) });

		if (!user) {
			error(401); // Not Authorized
		}

		const verificationCode = await db.transaction(async (tx) => {
			return await generateVerificationCode(tx, user.id, user.email);
		});

		await sendVerificationCode(verificationCode, user.email);

		return redirect(pathname, { type: 'success', message: m.verification_code_resent() }, cookies);
	}
};
