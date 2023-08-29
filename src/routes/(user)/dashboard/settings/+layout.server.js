import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals: { getSession } }) {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/login');
	}
}