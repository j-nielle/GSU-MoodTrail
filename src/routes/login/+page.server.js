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

		if (error) {
			if (error.message === 'Email not confirmed') {
				return fail(400, {
					error: 'Email not confirmed'
				});
			} else if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					error: 'Invalid credentials.'
				});
			}
			return fail(500, {
				error: error.message
			});
		}

		throw redirect(303, '/dashboard');
	}
};
