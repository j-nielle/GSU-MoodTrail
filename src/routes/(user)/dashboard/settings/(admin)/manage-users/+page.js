import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ parent }) {
  const { supabase, session } = await parent();
	if (!session) {
		throw redirect(303, '/login');
	}

	const { data: users } = await supabase.from("Users").select()
  console.log(users)
	return {
    users: users || [],
		session: session
	};
}