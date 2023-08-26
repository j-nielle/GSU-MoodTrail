import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import { AuthApiError } from '@supabase/supabase-js';

/** @type {import('./$types').LayoutLoad} */
export async function load({ fetch, data, depends }) {
	depends('supabase:auth');

	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	});

	const { data: { session }, error } = await supabase.auth.getSession();

  if(error) {
    console.log(error.message);
    // if(error.message === 'Invalid Refresh Token: Already Used') {
    //   return { supabase, session: null }
    // }
  }

	return { supabase, session };
}
