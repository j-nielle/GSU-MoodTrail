import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals: { supabase, getSession } }) {
  const session = await getSession();
  if (!session) {
    throw redirect(303, '/login');
  }

  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

	const { count } = await supabase
  .from("RequestEntries")
  .select("id", { count: "exact" });

  const { data: requests } = await supabase
    .from("RequestEntries")
    .select()
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

	const maxPage = Math.ceil(count / limit);

  return {
    requests: requests || [],
    session: session,
    page: page,
    limit: limit,
		maxPage: maxPage
  };
}