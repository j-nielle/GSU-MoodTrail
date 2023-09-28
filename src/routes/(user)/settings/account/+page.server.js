import { fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { supabase, getSession } }) {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/login');
	}

	const {
		data: { user }
	} = await supabase.auth.getUser();

	return {
		user: user || []
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	resetPassword: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const password = formData.get('password');

		const { error } = await supabase.auth.updateUser({ password });

		if (error) {
			console.log(error);
			return fail(400, {
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
