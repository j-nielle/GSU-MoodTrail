import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit';
import { dev } from '$app/environment';
import { inject } from '@vercel/analytics';

inject({ mode: dev ? 'development' : 'production' });

/** @type {import('./$types').LayoutLoad} */
export async function load({ fetch, data, depends }) {
	depends('supabase:auth');

	const supabase = createSupabaseLoadClient({
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
		event: { fetch },
		serverSession: data.session
	});

	try{
		const { data: { session }, error } = await supabase.auth.getSession();

		const { data: requests, error: reqDataErr } = await supabase
			.from('Request')
			.select('*')
			.order('created_at', { ascending: false });
		
		const { data: pendingRequests, error: pendingReqDataErr } = await supabase
			.from('Request')
			.select('*')
			.eq('iscompleted', 'FALSE')
			.order('created_at', { ascending: false });
		
		if(error || reqDataErr || pendingReqDataErr) throw error;
		return { 
			supabase, 
			session, 
			requests: requests || [],
			pendingRequests: pendingRequests || []
		};
	}catch(error){
		console.error(error);
	}
}

/** @type {import('@sveltejs/adapter-vercel').Config} */
export const config = {
	runtime: 'nodejs18.x'
};
