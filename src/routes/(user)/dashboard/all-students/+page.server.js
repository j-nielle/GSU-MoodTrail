import { redirect, fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, locals: { supabase, getSession } }) {
	const session = await getSession();
	if (!session) {
		throw redirect(303, '/login');
	}

	const { data: students } = await supabase
		.from('Student')
		.select()
		.order('name', { ascending: true });

	const { data: courses } = await supabase
		.from('Course')
		.select()
		.order('course', { ascending: true });

	return {
		students: students || [],
		session: session,
		courses: courses || []
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	addStudent: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();

		const newID = formData.get('addID');
		const newFName = formData.get('addFName');
		const newMName = formData.get('addMName');
		const newLName = formData.get('addLName');
		const newCourse = formData.get('addCourse');
		const newYearLevel = formData.get('addYrLvl');

    const newName = `${newFName} ${newMName}. ${newLName}`.trim().toUpperCase();

		let errors = [], errorMsg, errorInput;

		if (newID?.length !== 10 || (newID != '' && /[^0-9]/.test(newID))) {
			errors.push({
				errorInput: 'addID',
				error: 'Please enter a valid ID number.'
			});
		}

		if (newName?.length < 5 || !/^[A-Za-z]+(?:\s+[A-Za-z]+\s*\.?\s*)+$/.test(newName)) {
			errors.push({
				errorInput: 'newName',
				error: 'Please enter a valid name.'
			});
		}

		if (errors?.length > 0) {
			return {
				errors: errors
			};
		} else {
			try {
				const { data, error } = await supabase
					.from('Student')
					.insert([
						{
							id: newID,
							name: newName.toString().toUpperCase(),
              year_level_id: newYearLevel,
							course_id: newCourse							
						}
					])
					.select();
        console.log(data)
			} catch (error) {
				console.log(error);
			}
		}
	}
};
