import type { Actions, PageServerLoad } from './$types';
import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { loginSchema, userTable } from '$lib/drizzle/schema/auth';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { verifyHCaptcha } from '$lib/server/hcaptcha';
import { verifyPassword } from '$lib/server/passwords';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(loginSchema));

	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const { request, cookies } = event;

		const form = await superValidate(request, zod(loginSchema));

		const { hCaptchaToken, username, password } = form.data;

		const success = await verifyHCaptcha(hCaptchaToken);

		if (!success) {
			setError(form, '', m.hcaptcha_verification_failure());
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const existingUser = await db.query.userTable.findFirst({
			where: eq(userTable.username, username)
		});

		if (!existingUser) {
			return message(form, m.authentication_failure());
		}

		const { passwordHash, passwordSalt } = existingUser;

		const validPassword = await verifyPassword(password, passwordHash, passwordSalt);

		if (!validPassword) {
			return message(form, m.authentication_failure());
		}

		// Start the user session.
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect('/', { type: 'success', message: m.logged_in() }, cookies);
	}
};
