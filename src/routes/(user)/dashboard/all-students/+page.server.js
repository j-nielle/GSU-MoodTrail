import { redirect, fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals: { supabase, getSession } }) {
  const session = await getSession();
  if (!session) {
    throw redirect(303, '/login');
  }

  const { data: students } = await supabase
    .from("Student")
    .select()
    .order("name", { ascending: true })

  const { data: courses } = await supabase
    .from("Course")
    .select()
    .order("course", { ascending: true })

  return {
    students: students || [],
    session: session,
    courses: courses || [],
  };
}

/** @type {import('./$types').Actions} */
export const actions = {
	addStudent: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    console.log(formData)
	}
};