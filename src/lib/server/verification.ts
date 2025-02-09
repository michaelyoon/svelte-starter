import { error, type RequestEvent } from '@sveltejs/kit';
import { fail, setError, type Infer, type SuperValidated } from 'sveltekit-superforms';
import { redirect } from 'sveltekit-flash-message/server';
import type { RandomReader } from '@oslojs/crypto/random';
import { eq, or } from 'drizzle-orm';
import { generateRandomString } from '@oslojs/crypto/random';
import { htmlRender } from '@sveltelaunch/svelte-5-email';
import VerificationCodeTemplate from '$lib/emails/verification-code-template.svelte';
import { sendEmail } from '$lib/server/email';
import { db, type Transaction } from './db';
import { userTable, verificationCodeTable, verifySchema } from '$lib/drizzle/schema';
import * as m from '$lib/paraglide/messages.js';
import { VERIFICATION_CODE_ALPHABET, VERIFICATION_CODE_DURATION_MINUTES } from './constants';
import { MINUTE_IN_MS, VERIFICATION_CODE_LENGTH } from '$lib/constants';
import { SEND_MAIL_FROM } from '$env/static/private';
import { PUBLIC_APP_NAME } from '$env/static/public';

const random: RandomReader = {
	read(bytes) {
		crypto.getRandomValues(bytes);
	}
};

/**
 * "The verification code should be at least 8 digits if the code is numeric, and at
 * least 6 digits if it's alphanumeric. Use a stronger code if the verification is part
 * of a secure process, like creating a new account or changing contact information.
 * You should avoid using both lowercase and uppercase letters. You may also want to
 * remove numbers and letters that can be misread (0, O, 1, I, etc). It must be
 * generated using a cryptographically secure random generator.
 *
 * "A single verification code should be tied to a single user and email. This is
 * especially important if you allow users to change their email address after they're
 * sent an email. Each code should be valid for at least 15 minutes (anywhere between
 * 1-24 hours is recommended). The code must be single-use and immediately invalidated
 * after validation. A new verification code should be generated every time the user
 * asks for another email/code."
 *
 * @see https://thecopenhagenbook.com/email-verification
 */
export async function generateVerificationCode(tx: Transaction, userId: string, email: string) {
	// We delete existing codes based on the user's ID, not their email address. If we used email address,
	// then one user could, in theory, delete another user's verification codes, if they were to change
	// their email to another user's email.
	//
	// We do prevent a user from changing their email to one that is registered by another user, but it
	// still seems wise to prevent this function from being misused.
	//
	await tx.delete(verificationCodeTable).where(or(eq(verificationCodeTable.userId, userId)));
	// .where(or(eq(verificationCodeTable.userId, userId), eq(verificationCodeTable.email, email)));

	const value = generateRandomString(random, VERIFICATION_CODE_ALPHABET, VERIFICATION_CODE_LENGTH);

	const expiresAt = new Date(Date.now() + VERIFICATION_CODE_DURATION_MINUTES * MINUTE_IN_MS);

	await tx.insert(verificationCodeTable).values({ userId, email, value, expiresAt });

	return value;
}

export async function sendVerificationCode(verificationCode: string, email: string) {
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
}

export async function verifyCode(form: SuperValidated<Infer<typeof verifySchema>>, value: string) {
	const verificationCode = await db.query.verificationCodeTable.findFirst({
		where: eq(verificationCodeTable.value, value)
	});

	if (!verificationCode) {
		setError(form, 'verificationCode', m.invalid_verification_code());

		return fail(400, { form });
	} else {
		const { expiresAt } = verificationCode;

		const now = new Date();

		if (expiresAt <= now) {
			setError(form, 'verificationCode', m.expired_verification_code());

			return fail(400, { form });
		}
	}

	const { userId } = verificationCode;

	const user = await db.query.userTable.findFirst({ where: eq(userTable.id, userId) });

	if (!user) {
		error(400); // Bad Request
	}

	return verificationCode;
}

export async function handleResendVerificationCodeRequest(event: RequestEvent) {
	const {
		locals,
		url: { pathname },
		cookies
	} = event;

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
