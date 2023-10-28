// @ts-nocheck
import { redirect, fail } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SECRET_SERVICE_ROLE_KEY } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { supabase, getSession } }) {
	const session = await getSession();

	if (!session) {
		throw redirect(303, '/login');
	}

	const { data } = await supabase
		.from('Users')
		.select()
		.order('username', { ascending: true });

	const { data: { user: currentAdmin }, error } = await supabase.auth.getUser();

	const users = data.filter((user) => { return user.id != currentAdmin.id });

	return {
		users: users || [],
		session: session
	};
}

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

		if (!username || !role || !email || !password){
			return {
				error: "Missing fields. Please try again later.",
				success: false
			};
		}
		else {
			try {
				const { data, error } = await adminAuthClient.createUser({
					email: email,
					password: password,
					user_metadata: { username: username, role: role },
					role: role,
					email_confirm: true
				});
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
		}
	},

	editUser: async ({ request, locals: { supabase } }) => {
		const supabaseAdminClient = createClient(PUBLIC_SUPABASE_URL, SECRET_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});

		const { data: { user } } = await supabase.auth.getUser();
		const adminAuthClient = supabaseAdminClient.auth.admin;

		const formData = await request.formData();
		const userID = formData?.get('userID');
		const newUsername = formData?.get('editUsername');
		const newRole = formData?.get('editRole');
		const newEmail = formData?.get('editEmail');

		if(userID == user.id){ // just in case
			if(newRole != user.role){
				return {
					error: "Unable to change current user's role.",
					success: false
				};
			}
		}
		else if (!userID || !newUsername || !newEmail || !newRole){
			return {
				error: "Missing fields. Please try again later.",
				success: false
			};
		}
		else{
			try {
				const { data, error } = await adminAuthClient.getUserById(userID);
				console.error(error);
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
				console.error(error);
				return fail(400, {
					error: error.message,
					success: false
				});
			}
		}
	},

	removeUser: async ({ request, locals: { supabase }  }) => {
		const supabaseAdminClient = createClient(PUBLIC_SUPABASE_URL, SECRET_SERVICE_ROLE_KEY, {
			auth: {
				autoRefreshToken: false,
				persistSession: false
			}
		});
		const { data: { user } } = await supabase.auth.getUser();
		const adminAuthClient = supabaseAdminClient.auth.admin;

		const formData = await request.formData();
		const userID = formData?.get('userID');
		
		if(userID == user.id){ // just in case
			return {
				error: "Unable to delete current user.",
				success: false
			};
		}
		else {
			try {
				const { data, error } = await adminAuthClient.deleteUser(userID);
				
				if (error) {
					console.error(error);
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
	}
};
