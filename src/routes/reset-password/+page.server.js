import { fail } from '@sveltejs/kit';

export const actions = {
	requestPassReset: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData.get('email');

		const { error } = await supabase.auth.resetPasswordForEmail(email, {
			redirectTo: `${url.origin}/auth/callback?next=/dashboard/settings/account`
		});

		if (error) {
			console.log(error);
			if (error.status === 429) {
				return fail(429, {
					error: error.message,
					success: false
				});
			}
			return fail(500, {
				error: error.message,
				success: false
			});
		}

		return {
			success: true,
			error: ''
		};
	}
};
