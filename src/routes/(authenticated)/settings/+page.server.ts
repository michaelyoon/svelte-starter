import type { Actions, PageServerLoad } from './$types';
import { and, eq, not } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { userSettingsSchema, userTable } from '$lib/drizzle/schema';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import * as m from '$lib/paraglide/messages.js';
import { redirect } from 'sveltekit-flash-message/server';

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

		const { email, username } = form.data;

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

		await db.update(userTable).set({ email, username }).where(eq(userTable.id, user!.id));

		return redirect(pathname, { type: 'success', message: m.changes_saved() }, cookies);
	}
};
