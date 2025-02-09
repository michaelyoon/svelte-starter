import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { resetPasswordSchema } from '$lib/drizzle/schema';
import {
	handleResendVerificationCodeRequest,
	handleResetPasswordRequest
} from '$lib/server/verification';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(resetPasswordSchema));

	return { form };
};

export const actions: Actions = {
	verify: async (event) => {
		return await handleResetPasswordRequest(event, {
			redirectUrl: '/',
			flashMessage: m.password_reset()
		});
	},

	// XXX: this doesn't work because the user is not logged in
	resend: handleResendVerificationCodeRequest
};
