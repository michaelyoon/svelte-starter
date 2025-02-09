import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { verifySchema } from '$lib/drizzle/schema';
import {
	handleVerifyEmailRequest,
	handleResendVerificationCodeRequest
} from '$lib/server/verification';
import * as m from '$lib/paraglide/messages.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(verifySchema));

	return { form };
};

export const actions: Actions = {
	verify: async (event) => {
		return await handleVerifyEmailRequest(event, { redirectUrl: '/', message: m.email_verified() });
	},

	resend: handleResendVerificationCodeRequest
};
