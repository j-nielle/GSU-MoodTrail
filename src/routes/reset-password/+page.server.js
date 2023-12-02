// @ts-nocheck
export const actions = {
	requestPassReset: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData?.get('email');

		try {
			let { data: user, error } = await supabase
				.from('Users')
				.select("*")
				.eq('email', email)
			if(error) throw error;
			else if(user?.length > 0){
				const { error: resetPassError } = await supabase.auth.resetPasswordForEmail(email, {
					redirectTo: `${url.origin}/auth/callback?next=/settings/account`
				});
		
				if (resetPassError)  throw resetPassError;
				return {
						success: true,
						error: false
					};
			}
			else if(user?.length === 0 && error === null){
				return {
					error: "Email not found in our database.",
					success: false
				}
			}
		} catch (error) {
			console.error(error)
			return {
				error: error,
				success: false
			}
		}
	}
};
