import { json, error } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export async function GET({ locals: { supabase, getSession } }) {
    const session = await getSession();
    if (!session) {
        // the user is not signed in
        throw error(401, { message: 'Unauthorized' });
    }
    const { data } = await supabase.from('test').select('*');

    return json({ data });
};