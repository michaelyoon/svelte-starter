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
		await handleResetPasswordRequest(event, { redirectUrl: '/', message: m.password_reset() });
	},

	resend: handleResendVerificationCodeRequest
};
