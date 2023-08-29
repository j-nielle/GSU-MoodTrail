import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({ url, parent }) {
  const { supabase, session } = await parent();
	if (!session) {
		throw redirect(303, '/login');
	}
  // const page = parseInt(url.searchParams.get('page') || '1');
  // const limit = parseInt(url.searchParams.get('limit') || '10');
  // const offset = (page - 1) * limit;

  // const { count } = await supabase.from("Users").select("id", { count: "estimated" });
	const { data: users } = await supabase.from("Users").select()// .range(offset, offset + limit - 1);

  // let maxPage = 0;

  // if(count != null)	{ maxPage = Math.ceil(count / limit); }

	return {
    users: users || [],
		session: session,
    // page: page,
    // limit: limit,
    // count: count,
		// maxPage: maxPage
	};
}