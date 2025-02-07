import type { Actions, PageServerLoad } from './$types';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { loginSchema, userTable } from '$lib/drizzle/schema/auth';
import { createSession, generateSessionToken, setSessionTokenCookie } from '$lib/server/auth';
import { verifyPassword } from '$lib/server/passwords';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(loginSchema));

	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const { request, cookies } = event;

		const form = await superValidate(request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { username, password } = form.data;

		const existingUser = await db.query.userTable.findFirst({
			where: eq(userTable.username, username)
		});

		const messageText = 'Incorrect username or password'; // XXX: use ParaglideJS

		if (!existingUser) {
			return message(form, messageText);
		}

		const { passwordHash, passwordSalt } = existingUser;

		const validPassword = await verifyPassword(password, passwordHash, passwordSalt);

		if (!validPassword) {
			return message(form, messageText);
		}

		// Start the user session.
		const sessionToken = generateSessionToken();
		const session = await createSession(sessionToken, existingUser.id);
		setSessionTokenCookie(event, sessionToken, session.expiresAt);

		const flashMessage = 'Signed in.'; // XXX: use ParaglideJS

		return redirect('/', { type: 'success', message: flashMessage }, cookies);
	}
};
