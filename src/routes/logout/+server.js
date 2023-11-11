import { redirect } from '@sveltejs/kit';

export async function POST({ locals: { supabase } }) {
	await supabase.auth.signOut();
	throw redirect(303, '/login');
}