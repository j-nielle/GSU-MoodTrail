import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals: { supabase, getSession } }) {
  const session = await getSession();
  if (!session) {
    throw redirect(303, '/login');
  }

  // const page = parseInt(url.searchParams.get('page') || '1');
  // const limit = parseInt(url.searchParams.get('limit') || '5');
  // const offset = (page - 1) * limit;

	// const { count } = await supabase
  // .from("RequestEntries")
  // .select("id", { count: "estimated" });

  const { data: students } = await supabase
    .from("Student")
    .select()
    .order("name", { ascending: true })
    //.range(offset, offset + limit - 1);

  // let maxPage = 0;

  // if(count != null)	{ maxPage = Math.ceil(count / limit); }

  return {
    students: students || [],
    session: session,
    // page: page,
    // limit: limit,
    // count: count,
		// maxPage: maxPage
  };
}