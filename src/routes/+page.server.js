import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals: { getSession } }) {
	const session = await getSession(); // this will be null if the user is not logged in
	if (session) {
		throw redirect(303, '/dashboard');
	}

	return {
		url: url.origin,
	};
}
