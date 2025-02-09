import type { Actions, PageServerLoad } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { redirect } from 'sveltekit-flash-message/server';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { resetPasswordSchema, userTable, verificationCodeTable } from '$lib/drizzle/schema';
import { handleResendVerificationCodeRequest, verifyCode } from '$lib/server/verification';
import { hashPassword, validatePasswordStrength } from '$lib/server/passwords';
import { startSession, invalidateAllSessions } from '$lib/server/auth';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(resetPasswordSchema));

	return { form };
};

export const actions: Actions = {
	verify: async (event) => {
		const { request, cookies } = event;

		const form = await superValidate(request, zod(resetPasswordSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { verificationCode: value, password } = form.data;

		const result = await verifyCode(value);

		const { verificationCode } = result;
		let { valid, message } = result;

		if (!valid) {
			setError(form, 'verificationCode', message);
		}

		({ valid, message } = validatePasswordStrength(password));

		if (!valid) {
			setError(form, 'password', message);
			return fail(400, { form });
		}

		const { userId } = verificationCode!;

		const { passwordHash, passwordSalt } = await hashPassword(password);

		const now = new Date();

		await db.transaction(async (tx) => {
			// Update the user's password.
			await tx
				.update(userTable)
				.set({ passwordHash, passwordSalt, verifiedAt: now, updatedAt: now })
				.where(eq(userTable.id, userId));

			// Delete the verification code.
			await tx.delete(verificationCodeTable).where(eq(verificationCodeTable.value, value));

			await invalidateAllSessions(tx, userId, event);

			// Start a session for the newly-verified user, so that they don't have to login again.
			await startSession(tx, userId, event);
		});

		return redirect('/', { type: 'success', message: m.password_reset() }, cookies);
	},

	// XXX: this doesn't work because the user is not logged in
	resend: handleResendVerificationCodeRequest
};
