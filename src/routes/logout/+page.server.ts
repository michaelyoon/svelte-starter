import type { Actions } from './$types';
import { error } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/server/auth';

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

		const message = 'Signed out'; // XXX: use ParaglideJS
		return redirect('/', { type: 'success', message }, cookies);
	}
};
