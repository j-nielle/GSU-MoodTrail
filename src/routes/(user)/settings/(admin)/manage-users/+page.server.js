import { redirect, fail } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SECRET_SERVICE_ROLE_KEY } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals: { supabase, getSession } }) {
	const session = await getSession();

	if (!session) {
		throw redirect(303, '/login');
	}

	// const { data: users } = await supabase.from('Users').select();
	const supabaseAdminClient = createClient(PUBLIC_SUPABASE_URL, SECRET_SERVICE_ROLE_KEY, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	})

	const adminAuthClient = supabaseAdminClient.auth.admin;

	
	const { data: { users }, error } = await adminAuthClient.listUsers()
	console.log(users)
	return {
		users: users || [],
		session: session
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	newUser: async ({ request }) => {

		const supabaseAdminClient = createClient(PUBLIC_SUPABASE_URL, SECRET_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		})
	
		const adminAuthClient = supabaseAdminClient.auth.admin;

		
const { data: { users }, error } = await adminAuthClient.listUsers()
    const formData = await request.formData();
    const name = formData?.get('addName');
		const role = formData?.get('addRole');
		const email = formData?.get('addEmail');
		const password = formData?.get('addPassword');

		console.log(formData)

		try {
			const { data, error } = await adminAuthClient.createUser({
				email: email,
				password: password,
				user_metadata: { name: name },
				role: role,
				email_confirm: true
			})
			console.log(data)
			if(error){
				console.log(error)
			}
		} catch (error) {
			console.log(error)
		}
		
		// const { data, error } = await supabaseAdminClient.auth.admin.deleteUser(
		// 	'715ed5db-f090-4b8c-a067-640ecee36aa0'
		// )

		
		// const { data: user, error } = await supabaseAdminClient.auth.admin.updateUserById(
		// 	'6aa5d0d4-2a9f-4483-b6c8-0cf4c6c98ac4',
		// 	{ user_metadata: { hello: 'world' } }
		// )

		// try{
		// 	const { data,error } = await supabase.auth.signUp({
		// 		email,
		// 		password,
		// 		options: {
		// 			data: {
		// 				name: name,
		// 				role: role
		// 			},
		// 		}
		// 	});
		// 	console.log(data,error)
		// }catch(error){
		// 	console.log(error)
		// }

		// if (error) {
		// 	console.log(error);
		// 	if (error instanceof AuthApiError && error.status === 400) {
		// 		return fail(400, {
		// 			message: 'Invalid email or password',
		// 			success: false
		// 		});
		// 	}
		// 	return fail(500, { message: 'Server error. Try again later.', success: false, email });
		// }

		// return {
		// 	success: true,
		// 	//email: 'Email will be sent shortly for to verify your account.'
		// };
	}
};
