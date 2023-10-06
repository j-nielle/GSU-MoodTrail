import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals: { getSession } }) {
	const session = await getSession();

	if (session) {
		throw redirect(303, '/dashboard');
	}

	return { url: url.origin };
}
