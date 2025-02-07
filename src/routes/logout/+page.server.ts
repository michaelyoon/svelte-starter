import type { Actions } from './$types';
import { error } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth';
import * as m from '$lib/paraglide/messages.js';

export const actions: Actions = {
	default: async (event) => {
		const {
			locals: { session },
			cookies
		} = event;

		if (!session) {
			error(401); // Not Authorized
		}

		await invalidateSession(session.id);

		deleteSessionTokenCookie(event);

		return redirect('/', { type: 'success', message: m.logged_out() }, cookies);
	}
};
