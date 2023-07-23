export const prerender = false;
export const ssr = true;

import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { supabase, getSession } }) {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/login');
	}

	const { data } = await supabase.from("RequestEntries").select().order("created_at", { ascending: false });
	const requests = data?.map((request) => request) || [];

	return {
		requests: requests
	};
}
