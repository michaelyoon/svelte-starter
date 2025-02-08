import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { changePasswordSchema, userTable } from '$lib/drizzle/schema';
import { hashPassword, verifyPassword } from '$lib/server/passwords';
import * as m from '$lib/paraglide/messages.js';
import { redirect } from 'sveltekit-flash-message/server';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(changePasswordSchema));

	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const form = await superValidate(request, zod(changePasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { password, newPassword } = form.data;

		const user = await db.query.userTable.findFirst({
			where: eq(userTable.id, locals.user!.id)
		});

		if (!user) {
			error(400); // Bad Request
		}

		const validPassword = await verifyPassword(password, user.passwordHash, user.passwordSalt);

		if (!validPassword) {
			setError(form, 'password', m.incorrect_password());
			return fail(400, { form });
		}

		const { passwordHash, passwordSalt } = await hashPassword(newPassword);

		await db
			.update(userTable)
			.set({ passwordHash, passwordSalt, updatedAt: new Date() })
			.where(eq(userTable.id, user.id));

		return redirect('/settings', { type: 'success', message: m.password_changed() }, cookies);
	}
};
