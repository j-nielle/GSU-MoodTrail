// @ts-nocheck
import { fail, redirect } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SECRET_SERVICE_ROLE_KEY } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { supabase, getSession } }) {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/login');
	}

	// try {
	// 	const { data: { user }, error } = await supabase.auth.getUser();
	// 	if(error) throw error;
	// 	return {
	// 		user: user || []
	// 	};
	// } catch (error) {
	// 	console.error(error)
	// }
}