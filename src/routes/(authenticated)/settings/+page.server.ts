import type { Actions, PageServerLoad } from './$types';
import { and, eq, not } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { userSettingsSchema, userTable } from '$lib/drizzle/schema';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import * as m from '$lib/paraglide/messages.js';
import { redirect } from 'sveltekit-flash-message/server';
import { hashPassword } from '$lib/server/passwords';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await db.query.userTable.findFirst({
		where: eq(userTable.id, locals.user!.id)
	});

	const form = await superValidate(user!, zod(userSettingsSchema));

	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals: { user }, url: { pathname }, cookies }) => {
		const form = await superValidate(request, zod(userSettingsSchema));

		console.log(form);

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, username, password } = form.data;

		let existingUserCount = await db.$count(
			userTable,
			and(eq(userTable.email, email), not(eq(userTable.id, user!.id)))
		);

		if (existingUserCount > 0) {
			setError(form, 'email', m.email_already_registered());
		}

		existingUserCount = await db.$count(
			userTable,
			and(eq(userTable.username, username), not(eq(userTable.id, user!.id)))
		);

		if (existingUserCount > 0) {
			setError(form, 'username', m.username_unavailable());
		}

		if (!form.valid) {
			return fail(400, { form });
		}

		const original = await db.query.userTable.findFirst({ where: eq(userTable.id, user!.id) });

		let values: Record<string, string> = { email, username };

		if (password) {
			const { passwordHash, passwordSalt } = await hashPassword(password);
			values = { ...values, passwordHash, passwordSalt };
		}

		await db.update(userTable).set(values).where(eq(userTable.id, user!.id));

		let message: string;

		// The UI only allows changing one field at a time.
		if (email !== original!.email) {
			message = m.email_changed();
		} else if (username !== original!.username) {
			message = m.username_changed();
		} else {
			message = m.password_changed();
		}

		return redirect(pathname, { type: 'success', message }, cookies);
	}
};
