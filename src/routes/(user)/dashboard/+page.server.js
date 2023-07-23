import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { supabase, getSession } }) {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/login');
	}

	const { data } = await supabase.from("RequestEntries").select();
	const requests = new Map(data?.map(entry => [entry.id, entry]));
	let newData = false
	const channel = supabase.channel('schema-db-changes');
	channel
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'RequestEntries'
			},
			(payload) => {
				newData = true
				console.log('new request detected');
			}
		)
		.subscribe((status) => console.log(status));

    return {
		newData: newData
	};
}
