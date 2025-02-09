import type { Actions, PageServerLoad } from './$types';
import { isActionFailure } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	userTable,
	verificationCodeTable,
	verifySchema,
	type SelectVerificationCode
} from '$lib/drizzle/schema';
import { invalidateAllSessions, startSession } from '$lib/server/auth';
import { handleResendVerificationCodeRequest, verifyCode } from '$lib/server/verification';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(verifySchema));

	return { form };
};

export const actions: Actions = {
	verify: async (event) => {
		const { request, cookies } = event;

		const form = await superValidate(request, zod(verifySchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { verificationCode: value } = form.data;

		const result = await verifyCode(form, value);

		if (isActionFailure(result)) {
			return result;
		}

		const verificationCode: SelectVerificationCode = result as SelectVerificationCode;

		const { userId, email } = verificationCode;

		const now = new Date();

		await db.transaction(async (tx) => {
			await tx
				.update(userTable)
				.set({ email, verifiedAt: now, updatedAt: now })
				.where(eq(userTable.id, userId));

			await tx.delete(verificationCodeTable).where(eq(verificationCodeTable.userId, userId));

			// "All sessions of a user should be invalidated when their email is verified."
			// - https://thecopenhagenbook.com/email-verification#email-verification-codes
			await invalidateAllSessions(tx, userId, event);

			// Start a session for the now-verified user, so that they don't have to login again.
			await startSession(tx, userId, event);
		});

		return redirect('/', { type: 'success', message: m.email_verified() }, cookies);
	},

	resend: handleResendVerificationCodeRequest
};
