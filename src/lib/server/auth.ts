import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase64url, encodeHexLowerCase } from '@oslojs/encoding';
import type { RandomReader } from '@oslojs/crypto/random';
import { generateRandomString } from '@oslojs/crypto/random';
import { db } from '$lib/server/db';
import { sessionTable, userTable, type InsertSession } from '$lib/drizzle/schema';
import { DAY_IN_MS, VERIFICATION_CODE_LENGTH } from '$lib/constants';
import { RENEW_SESSION_DAYS, SESSION_DURATION_DAYS, VERIFICATION_CODE_ALPHABET } from './constants';

const random: RandomReader = {
	read(bytes) {
		crypto.getRandomValues(bytes);
	}
};

export type SessionUser = {
	id: string;
	username: string;
};

export const sessionCookieName = 'auth-session';

export function generateSessionToken() {
	const bytes = crypto.getRandomValues(new Uint8Array(18));
	const token = encodeBase64url(bytes);
	return token;
}

export async function createSession(token: string, userId: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const session: InsertSession = {
		id: sessionId,
		userId,
		expiresAt: new Date(Date.now() + DAY_IN_MS * 30)
	};

	await db.insert(sessionTable).values(session);

	return session;
}

export async function validateSessionToken(token: string) {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

	const [result] = await db
		.select({
			// Adjust user table here to tweak returned data
			user: { id: userTable.id, username: userTable.username },
			session: sessionTable
		})
		.from(sessionTable)
		.innerJoin(userTable, eq(sessionTable.userId, userTable.id))
		.where(eq(sessionTable.id, sessionId));

	if (!result) {
		return { session: null, user: null };
	}
	const { session, user } = result;

	const sessionExpired = Date.now() >= session.expiresAt.getTime();
	if (sessionExpired) {
		await db.delete(sessionTable).where(eq(sessionTable.id, session.id));
		return { session: null, user: null };
	}

	const renewSession = Date.now() >= session.expiresAt.getTime() - RENEW_SESSION_DAYS * DAY_IN_MS;

	if (renewSession) {
		session.expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * DAY_IN_MS);

		await db
			.update(sessionTable)
			.set({ expiresAt: session.expiresAt })
			.where(eq(sessionTable.id, session.id));
	}

	return { session, user };
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>;

export async function invalidateSession(sessionId: string) {
	await db.delete(sessionTable).where(eq(sessionTable.id, sessionId));
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: '/'
	});
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: '/'
	});
}
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
export function generateVerificationCode() {
	return generateRandomString(random, VERIFICATION_CODE_ALPHABET, VERIFICATION_CODE_LENGTH);
}
