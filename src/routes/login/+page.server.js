import { fail, redirect } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';

export const actions = {
	login: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const email = formData.get('email');
		const password = formData.get('password');

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if(error) {
			console.error("ERROR:",error.message)
			return fail(400, {
				error: error.message,
				success: false
			});
		}

		throw redirect(303, '/dashboard');
	}
};
