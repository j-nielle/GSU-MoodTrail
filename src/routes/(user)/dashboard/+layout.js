// import { PUBLIC_SUPABASE_URL } from '$env/static/public';
// import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
// import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';

// export const prerender = true;

// /** @type {import('./$types').LayoutLoad} */
// export async function load({ fetch, data, depends }) {
// 	depends('supabase:auth');

// 	// createSupabaseLoadClient caches the client when running in a
// 	// browser environment and therefore does not create a new client
// 	// for every time the load function run
// 	const supabase = createSupabaseLoadClient({
// 		supabaseUrl: PUBLIC_SUPABASE_URL,
// 		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
// 		event: { fetch },
// 		serverSession: data.session
// 	});

// 	const {
// 		data: { session }
// 	} = await supabase.auth.getSession();

// 	return { supabase, session };
// }
