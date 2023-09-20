import { redirect } from '@sveltejs/kit';

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

		let errors = [];

		if (newID?.length < 10 || (newID?.slice(0, 3) != '202' && /[^0-9]/.test(newID))) {
			errors.push({
				errorInput: 'addID',
				error: 'Please enter a valid ID number (e.g 2020303123).'
			});
		}

		if (newName?.length < 5 || !/^[A-Za-z]+(?:\s+[A-Za-z]+\s*\.?\s*)+$/.test(newName)) {
			errors.push({
				errorInput: 'newName',
				error: 'Please enter a valid name.'
			});
		}

		try {
			const { data: existingStudent, error } = await supabase
				.from('Student')
				.select('*')
				.eq('id', newID)
				.eq('name', newName)
				.eq('year_level_id', newYearLevel)
				.eq('course_id', newCourse);

			if (existingStudent.length > 0) {
				errors.push({
					errorInput: 'existingStudent',
					error: 'Student already exists.'
				});
			} else {
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

				if (error) {
					console.log(error);
					if (error.message === 'duplicate key value violates unique constraint "St_pkey"') {
						errors.push({
							errorInput: 'duplicateID',
							error: 'Student ID already exists.'
						});
					}
					if (
						error.message ===
						'duplicate key value violates unique constraint "unique_name_constraint"'
					) {
						errors.push({
							errorInput: 'duplicateName',
							error: 'Student already exists.'
						});
					}
				}
			}
		} catch (error) {
			console.log(error);
		}

		if (errors?.length > 0) {
			return {
				errors: errors
			};
		} else {
			return {
				errors: [],
				success: true
			};
		}
	},

	editStudent: async ({ request, locals: { supabase } }) => {
		const formData = await request.formData();
		console.log(formData);

		let errors = [];

		// try {
		// 	const { data: existingStudent, error } = await supabase
		// 	.from('Student')
		// 	.select('*')
		// 	.eq('id', newID)
		// 	.eq('name', newName)
		// 	.eq('year_level_id', newYearLevel)
		// 	.eq('course_id', newCourse);
		// 	console.log(error)
		// 	if (existingStudent.length > 0) {
		// 		errors.push({
		// 			errorInput: 'existingStudent',
		// 			error: 'Student already exists.'
		// 		});
		// 	}else{
		// 		const { data, error } = await supabase
		// 			.from('Student')
		// 			.update({ other_column: 'otherValue' })
		// 			.eq('some_column', 'someValue')
		// 			.select();
		// 	}
		// } catch (error) {
		// 	console.log(error);
		// }
	}
};
