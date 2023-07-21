import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { supabase, getSession } }) {
    const session = await getSession();
    if (!session) {
        throw redirect(303, '/login');
    }

    const { data } = await supabase.from("Student").select();
    console.log(data)
    // return {
    //   students: data ?? [],
    // };
}