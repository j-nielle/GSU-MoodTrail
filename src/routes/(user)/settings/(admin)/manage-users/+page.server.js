// @ts-nocheck
import { redirect, fail } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SECRET_SERVICE_ROLE_KEY } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals: { supabase, getSession } }) {
	const session = await getSession();

	if (!session) {
		throw redirect(303, '/login');
	}

	const { data: users } = await supabase
		.from('Users')
		.select()
		.order('username', { ascending: true });

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
		});

		const adminAuthClient = supabaseAdminClient.auth.admin;

		const formData = await request.formData();
		const username = formData?.get('addName') || 'User';
		const role = formData?.get('addRole');
		const email = formData?.get('addEmail');
		const password = formData?.get('addPassword');

		// soon: form and error handling ...

		try {
			const { data, error } = await adminAuthClient.createUser({
				email: email,
				password: password,
				user_metadata: { username: username, role: role },
				role: role,
				email_confirm: true
			});
			console.log(data, error);
			if (error) {
				console.log(error);
			}
		} catch (error) {
			console.log(error);
		}
	},

	editUser: async ({ request, locals: { supabase } }) => {
		const supabaseAdminClient = createClient(PUBLIC_SUPABASE_URL, SECRET_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});

		const adminAuthClient = supabaseAdminClient.auth.admin;

		const formData = await request.formData();
		const userID = formData?.get('userID');
		const userPass = formData?.get('userPass');
		const newUsername = formData?.get('editUsername');
		const newRole = formData?.get('editRole');
		const newEmail = formData?.get('editEmail');

		console.log(formData);

		try {
			const { data, error } = await adminAuthClient.getUserById(userID);
			console.log(error);
			if (
				data?.user.email === newEmail &&
				data?.user.role === newRole &&
				data?.user.user_metadata.name === newUsername
			) {
				// return {
				// 	updateSuccessInAuthUsers: false,
				// 	error: error.message
				// }
			} else {
				const { data, error } = await adminAuthClient.updateUserById(userID, {
					email: newEmail,
					user_metadata: { username: newUsername, role: newRole },
					role: newRole
				});
				if (error) {
					console.log(error.message);
				} else {
					const { data: existingUser, error } = await supabase
						.from('Users')
						.select('*')
						.eq('id', userID)
						.eq('username', newUsername)
						.eq('email', newEmail)
						.eq('password', userPass)
						.eq('role', newRole);
					if (error) {
						console.log(error);
						// return {
						// 	updateSuccessInPublicUsers: false,
						// 	error: error.message
						// }
					} else {
						const { data, error } = await supabase
							.from('Users')
							.update({
								username: newUsername,
								password: userPass,
								email: newEmail,
								role: newRole
							})
							.eq('id', userID)
							.select();
						if (error) { console.log(error) }
						return {
							updateSuccess: true
						};
					}
				}
			}
		} catch (error) {
			console.log(error);
			return {
				overallUpdateSuccess: false,
				error: error.message
			};
		}
	},

	removeUser: async ({ request }) => {
		const supabaseAdminClient = createClient(PUBLIC_SUPABASE_URL, SECRET_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});

		const adminAuthClient = supabaseAdminClient.auth.admin;

		const formData = await request.formData();
		const userID = formData?.get('userID');

		try {
			const { data, error } = await adminAuthClient.deleteUser(userID);
			console.log(data);
			if (error) {
				console.log(error);
				return {
					removalSuccess: false,
					error: error.message
				};
			} else {
				return {
					removalSuccess: true
				};
			}
		} catch (error) {
			console.log(error);
		}
	}
};
