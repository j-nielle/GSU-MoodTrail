import { redirect } from '@sveltejs/kit'

/**
 * This is the server-side logout route handler
 *
 * @type {import('./$types').RequestHandler}
 */
export async function POST({ locals: { supabase } }) {
    await supabase.auth.signOut()
    throw redirect(303, '/')
}