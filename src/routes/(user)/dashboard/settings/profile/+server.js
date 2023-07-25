import { redirect } from '@sveltejs/kit';

export async function load({ parent }) {
	const { supabase, session } = await parent();
	if (!session) {
		throw redirect(303, '/');
	}
	const { data: tableData } = await supabase.from('profiles').select('*');

	return {
		user: session.user,
		tableData
	};
}