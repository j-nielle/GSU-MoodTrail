import { fail } from '@sveltejs/kit';

export const actions = {
	requestPassReset: async ({ request, url, locals: { supabase } }) => {
		const formData = await request.formData();
		const email = formData?.get('email');

		try {
			let { data: user, error } = await supabase
				.from('Users')
				.select("*")
				.eq('email', email)
			if(error){
				console.log(error)
				return {
					error: error.message,
					success: false
				}
			}
			else if(user?.length > 0){
				const { error } = await supabase.auth.resetPasswordForEmail(email, {
					redirectTo: `${url.origin}/auth/callback?next=/settings/account`
				});
		
				if (error) {
					console.log(error);
					return {
						error: error.message,
						success: false
					}
				}else{
					return {
						success: true,
						error: false
					};
				}
			}
			else if(user?.length === 0 && error === null){
				return {
					error: "Email not found.",
					success: false
				}
			}
		} catch (error) {
			console.log(error)
			return {
				error: error,
				success: false
			}
		}
	}
};
