import type { Actions, PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { changeEmailSchema, userTable } from '$lib/drizzle/schema';
import { verifyPassword } from '$lib/server/passwords';
import { generateVerificationCode } from '$lib/server/verification';
import { sendVerificationCode } from '$lib/server/verification';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(changeEmailSchema));

	return { form };
};

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
		const form = await superValidate(request, zod(changeEmailSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { newEmail, password } = form.data;

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

		let verificationCode: string | undefined = undefined;

		await db.transaction(async (tx) => {
			await tx
				.update(userTable)
				.set({ verifiedAt: null, updatedAt: new Date() })
				.where(eq(userTable.id, user.id));

			verificationCode = await generateVerificationCode(tx, user.id, newEmail);
		});

		// Require the user to verify their new email address.
		await sendVerificationCode(verificationCode!, newEmail);

		return redirect(
			'/verify-email',
			{ type: 'success', message: m.verification_code_sent() },
			cookies
		);
	}
};
