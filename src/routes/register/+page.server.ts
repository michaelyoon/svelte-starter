import type { Actions, PageServerLoad } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import { db } from '$lib/server/db';
import { registerSchema, userTable } from '$lib/drizzle/schema/auth';
import { generateUniqueId } from '$lib/server/random';
import { hashPassword } from '$lib/server/passwords';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(registerSchema));

	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const { request, cookies } = event;

		const form = await superValidate(request, zod(registerSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, username, password } = form.data;

		// XXX: check if email is already registered

		// XXX: check if username is already registered

		// Create the user.
		const id = generateUniqueId();

		const { passwordHash, passwordSalt } = await hashPassword(password);

		await db.insert(userTable).values({ id, username, email, passwordHash, passwordSalt });

		// Start a session for the new user.
		const sessionToken = generateSessionToken();

		const session = await createSession(sessionToken, id);

		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		const message = 'Account created'; // XXX: use ParaglideJS
		return redirect('/', { type: 'success', message }, cookies);
	}
};
