import { fail } from '@sveltejs/kit';

export const actions = {
	resetPassword: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const password = formData.get('password')

		const { error } = await supabase.auth.updateUser({ password });

		if (error) {
			console.log(error)
            return fail(400,{
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