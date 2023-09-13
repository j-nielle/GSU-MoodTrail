import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals: { supabase, getSession } }) {
  const session = await getSession();
  if (!session) {
    throw redirect(303, '/login');
  }

  const { data: requests } = await supabase
    .from("RequestEntries")
    .select()
    .order("created_at", { ascending: false })

  return {
    requests: requests || [],
    session: session
  };
}