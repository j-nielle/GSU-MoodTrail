import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { supabase, getSession } }) {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/login');
	}

	const { data: studentMood } = await supabase
		.from('StudentMoodEntries')
		.select()
		.order('created_at', { ascending: true });

	const { data: students } = await supabase
		.from('Student')
		.select()
		.order('name', { ascending: true });

	return {
		studentMood: studentMood || [],
		students: students || [],
		session: session
	};
}
