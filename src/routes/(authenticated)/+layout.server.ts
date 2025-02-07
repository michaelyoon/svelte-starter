// import { error } from '@sveltejs/kit';
import { redirect } from 'sveltekit-flash-message/server';
import * as m from '$lib/paraglide/messages.js';
// import db from '$lib/server/db.js';
// import { Users } from '$lib/drizzle-schema.js';
// import { eq } from 'drizzle-orm';

export async function load({ locals, url: { pathname }, cookies }) {
	const { session, user } = locals;
	if (!session || !user) {
		redirect(
			`/login?redirectTo=${pathname}`,
			{ type: 'error', message: m.authentication_required() },
			cookies
		);
	}

	// const currentUser = await db.query.Users.findFirst({
	// 	columns: { needsVerification: true },
	// 	where: eq(Users.id, locals.currentUser.id)
	// });

	// if (!currentUser) {
	// 	// This should never happen...
	// 	error(401); // Unauthorized
	// }

	// if (currentUser.needsVerification) {
	// 	redirect(
	// 		`/account/verify?redirectTo=${encodeURI(url.pathname)}`,
	// 		{ type: 'error', message: 'Verify your account to access this page.' },
	// 		cookies
	// 	);
	// }
}
