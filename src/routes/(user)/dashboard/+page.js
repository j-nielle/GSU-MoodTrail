import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
  const { supabase, session } = await parent();
  if (!session) {
    throw redirect(303, '/');
  }

	const { data: studentMood } = await supabase.from("StudentMoodEntries").select().order("created_at", { ascending: true });
	const { data: anonMood } = await supabase.from("AnonMoodEntries").select().order("created_at", { ascending: true });

	return {
		studentMood: studentMood || [],
		anonMood: anonMood || [],
		session: session
	};
};