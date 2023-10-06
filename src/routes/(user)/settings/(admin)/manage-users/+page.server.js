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

		try {
			const { data, error } = await adminAuthClient.createUser({
				email: email,
				password: password,
				user_metadata: { username: username, role: role },
				role: role,
				email_confirm: true
			});
			console.log("insert",data);
			if (error) {
				return fail(400, {
					error: error.message,
					success: false
				});
			}else{
				return {
					success: true,
					error: false
				}
			}
		} catch (error) {
			return fail(400, {
				error: error.message,
				success: false
			});
		}
	},

	editUser: async ({ request }) => {
		const supabaseAdminClient = createClient(PUBLIC_SUPABASE_URL, SECRET_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});

		const adminAuthClient = supabaseAdminClient.auth.admin;

		const formData = await request.formData();
		const userID = formData?.get('userID');
		const newUsername = formData?.get('editUsername');
		const newRole = formData?.get('editRole');
		const newEmail = formData?.get('editEmail');
		console.log(userID)
		try {
			const { data, error } = await adminAuthClient.getUserById(userID);
			console.log(error);
			if (error) {
				return fail(400, {
					error: error.message,
					success: false
				});
			} else {
				const { data, error } = await adminAuthClient.updateUserById(userID, {
					email: newEmail,
					user_metadata: { username: newUsername, role: newRole },
					role: newRole
				});
				console.log("update", data)
				if (error) {
					return fail(400, {
						error: error.message,
						success: false
					});
				}else{
					return {
						success: true,
						error: false
					}
				}
			}
		} catch (error) {
			console.log(error);
			return fail(400, {
				error: error.message,
				success: false
			});
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
			console.log("delete",data);
			if (error) {
				console.log(error);
				return fail(400, {
					error: error.message,
					success: false
				});
			} else {
				return {
					success: true,
					error: false
				};
			}
		} catch (error) {
			return fail(400, {
				error: error.message,
				success: false
			});
		}
	}
};
