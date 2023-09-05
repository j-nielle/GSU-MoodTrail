import { redirect, fail } from '@sveltejs/kit';
import { AuthApiError } from '@supabase/supabase-js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url,locals: { supabase, getSession } }) {
	const session = await getSession();

	if (!session) {
		throw redirect(303, '/login');
	}
  // const page = parseInt(url.searchParams.get('page') || '1');
  // const limit = parseInt(url.searchParams.get('limit') || '10');
  // const offset = (page - 1) * limit;

  // const { count } = await supabase.from("Users").select("id", { count: "estimated" });
	const { data: users } = await supabase.from("Users").select()// .range(offset, offset + limit - 1);

  // let maxPage = 0;

  // if(count != null)	{ maxPage = Math.ceil(count / limit); }

	return {
    users: users || [],
		session: session,
    // page: page,
    // limit: limit,
    // count: count,
		// maxPage: maxPage
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	newUser: async ({ request, url, locals: { supabase } }) => {
    const formData = await request.formData();
    const name = formData.get('addName');
		const role = formData.get('addRole');
		const email = formData.get('addEmail');
		const password = formData.get('addPassword');

		// const { error } = await supabase.auth.signUp({
		// 	email,
		// 	password,
		// 	options: {
		// 		data: {
    //       name: name,
    //       role: role
		// 		},
		// 	}
		// });
    
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