import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals: { supabase, getSession } }) {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/login');
	}

	const { data: studentMood } = await supabase
		.from('StudentMoodEntries')
		.select()
		.order('created_at', { ascending: true });

	const { data: students } = await supabase
		.from('Student')
		.select()
		.order('name', { ascending: true });

	return {
		studentMood: studentMood || [],
		students: students || [],
		session: session
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	addMoodEntry: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const studentID = formData?.get('studentID');
		const addMood = formData?.get('addMood');
		const addReason = formData?.get('addReason');

		try {
			const { data, error } = await supabase
				.from('StudentMood')
				.insert([
					{ student_id: studentID, mood_id: addMood, reason_id: addReason },
				])
				.select()

			if(error){
				console.log(error)
				return{
					success: false,
					error: error.message
				}
			}else{
				return{
					success: true,
					error: false
				}
			}
		} catch (error) {
			console.log(error)
			return{
				success: false,
				error: error
			}
		}
	}
};
