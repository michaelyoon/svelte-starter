import type { Actions, PageServerLoad } from './$types';
import { fail, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { forgotPasswordSchema, userTable } from '$lib/drizzle/schema';
import { generateVerificationCode, sendVerificationCode } from '$lib/server/verification';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(forgotPasswordSchema));

	return { form };
};

export const actions: Actions = {
	default: async ({ request, url: { pathname }, cookies }) => {
		const form = await superValidate(request, zod(forgotPasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email } = form.data;

		const user = await db.query.userTable.findFirst({ where: eq(userTable.email, email) });

		if (!user) {
			return redirect(pathname, { type: 'success', message: m.verification_code_sent() }, cookies);
		}

		await db.transaction(async (tx) => {
			const verificationCode = await generateVerificationCode(tx, user.id, email);

			await sendVerificationCode(verificationCode, email);
		});

		return redirect(
			'/reset-password/verify',
			{ type: 'success', message: m.verification_code_sent() },
			cookies
		);
	}
};
