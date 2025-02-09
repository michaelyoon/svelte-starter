import type { Actions, PageServerLoad } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { registerSchema, userTable } from '$lib/drizzle/schema/auth';
import { generateUniqueId } from '$lib/server/random';
import { hashPassword, validatePasswordStrength } from '$lib/server/passwords';
import { startSession } from '$lib/server/auth';
import { verifyHCaptcha } from '$lib/server/hcaptcha';
import { generateVerificationCode, sendVerificationCode } from '$lib/server/verification';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(registerSchema));

	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const { request, cookies } = event;

		const form = await superValidate(request, zod(registerSchema));

		const { hCaptchaToken, email, username, password } = form.data;

		const success = await verifyHCaptcha(hCaptchaToken);

		if (!success) {
			setError(form, 'hCaptchaToken', m.hcaptcha_verification_failure());
		}

		const { valid, message } = validatePasswordStrength(password);

		if (!valid) {
			setError(form, 'password', message!);
		}

		let existingUserCount = await db.$count(userTable, eq(userTable.email, email));

		if (existingUserCount > 0) {
			setError(form, 'email', m.email_already_registered());
		}

		existingUserCount = await db.$count(userTable, eq(userTable.username, username));

		if (existingUserCount > 0) {
			setError(form, 'username', m.username_unavailable());
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		// Create the user.
		const id = generateUniqueId();

		const { passwordHash, passwordSalt } = await hashPassword(password);

		let verificationCode: string | undefined = undefined;

		await db.transaction(async (tx) => {
			await tx.insert(userTable).values({ id, username, email, passwordHash, passwordSalt });

			verificationCode = await generateVerificationCode(tx, id, email);
		});

		// Email the verification code to the user.
		await sendVerificationCode(verificationCode!, email);

		// Start a session for the new user.
		await startSession(db, id, event);

		return redirect(
			'/verify-email',
			{ type: 'success', message: m.verification_code_sent() },
			cookies
		);
	}
};
