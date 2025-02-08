import type { Actions, PageServerLoad } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import { eq } from 'drizzle-orm';
import { htmlRender } from '@sveltelaunch/svelte-5-email';
import VerificationCodeTemplate from '$lib/emails/verification-code-template.svelte';
import { db } from '$lib/server/db';
import { registerSchema, userTable, verificationCodeTable } from '$lib/drizzle/schema/auth';
import { generateUniqueId } from '$lib/server/random';
import { hashPassword } from '$lib/server/passwords';
import {
	createSession,
	generateSessionToken,
	setSessionTokenCookie,
	generateVerificationCode
} from '$lib/server/auth';
import { verifyHCaptcha } from '$lib/server/hcaptcha';
import { sendEmail } from '$lib/server/email';
import * as m from '$lib/paraglide/messages.js';
import { SEND_MAIL_FROM, VERIFICATION_CODE_DURATION_MINUTES } from '$env/static/private';
import { PUBLIC_APP_NAME } from '$env/static/public';
import { MINUTE_IN_MS } from '$lib/constants';

const durationMinutes = parseInt(VERIFICATION_CODE_DURATION_MINUTES);

if (isNaN(durationMinutes)) {
	throw new Error(`Invalid VERIFICATION_CODE_DURATION_MINUTES: ${durationMinutes}`);
}

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
			setError(form, '', m.hcaptcha_verification_failure());
		}

		if (!form.valid) {
			return fail(400, { form });
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

		const verificationCode = generateVerificationCode();

		const { passwordHash, passwordSalt } = await hashPassword(password);

		await db.transaction(async (tx) => {
			await tx.insert(userTable).values({ id, username, email, passwordHash, passwordSalt });

			const expiresAt = new Date(Date.now() + durationMinutes * MINUTE_IN_MS);

			await tx
				.insert(verificationCodeTable)
				.values({ userId: id, email, value: verificationCode, expiresAt });
		});

		// Email the verification code to the user.
		const from = SEND_MAIL_FROM;

		const subject = m.verification_code_email_subject({
			appName: PUBLIC_APP_NAME,
			verificationCode
		});

		const html = htmlRender({
			template: VerificationCodeTemplate,
			props: {
				appName: PUBLIC_APP_NAME,
				verificationCode
			},
			options: {}
		});

		await sendEmail({ from, to: email, subject, html });

		// Start a session for the new user.
		const sessionToken = generateSessionToken();

		const session = await createSession(sessionToken, id);

		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect('/verify', { type: 'success', message: m.verification_code_sent() }, cookies);
	}
};
