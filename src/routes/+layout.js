// import { PUBLIC_SUPABASE_URL } from '$env/static/public'
// import { PRIVATE_SUPABASE_ANON_KEY } from '$env/static/private'
// import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';

// /** @type {import('./$types').LayoutLoad} */
// export async function load({ fetch, data, depends }) {
//     depends('supabase:auth');

//     const supabase = createSupabaseLoadClient({
//         supabaseUrl: PUBLIC_SUPABASE_URL,
//         supabaseKey: PRIVATE_SUPABASE_ANON_KEY,
//         event: { fetch },
//         serverSession: data.session
//     });

//     const {
//         data: { session }
//     } = await supabase.auth.getSession();

//     return { supabase, session };
// }