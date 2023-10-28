// @ts-nocheck
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

		let newName = '';

		if(newMName === null || newMName === undefined || newMName === '') {
			newName = `${newFName} ${newLName}`.trim().toUpperCase();
		}else{
			newName = `${newFName} ${newMName} ${newLName}`.trim().toUpperCase();
		}

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
					console.error(error);
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
			console.error(error);
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

		const editID = formData.get('editID');
		const editFName = formData.get('editFName');
		const editMName = formData.get('editMName');
		const editLName = formData.get('editLName');
		const editCourse = formData.get('editCourse');
		const editYearLevel = formData.get('editYrLvl');

		let errors = [];

		let editName = '';

		if(editMName === null || editMName === undefined || editMName === '') {
			editName = `${editFName} ${editLName}`.trim().toUpperCase();
		}else{
			editName = `${editFName} ${editMName}. ${editLName}`.trim().toUpperCase();
		}

		if (editID?.length < 10 || (editID?.slice(0, 3) != '202' && /[^0-9]/.test(editID))) {
			errors.push({
				errorInput: 'editID',
				error: 'Please enter a valid ID number (e.g 2020303123).'
			});
		}

		if (editName?.length < 5 || !/^[A-Za-z]+(?:\s+[A-Za-z]+\s*\.?\s*)+$/.test(editName)) {
			errors.push({
				errorInput: 'editName',
				error: 'Please enter a valid name.'
			});
		}

		try {
			const { data: prevStudentData, error } = await supabase
				.from('Student')
				.select('*')
				.eq('id', editID)
				.eq('name', editName)
				.eq('year_level_id', editYearLevel)
				.eq('course_id', editCourse);
			console.error(error);
			if (prevStudentData?.length > 0) {
				errors.push({
					errorInput: 'prevStudentData',
					error: 'No changes made. Please exit and try again.'
				});
			} else {
				const { data, error } = await supabase
					.from('Student')
					.update({
						id: editID,
						name: editName,
						year_level_id: editYearLevel,
						course_id: editCourse
					})
					.eq('id', editID)
					.select();
				console.error(error);
				if (error) {
					errors.push({
						errorInput: 'error',
						error: error.message
					});
				}
			}
		} catch (error) {
			console.error(error);
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

	removeStudent: async ({ request, locals: { supabase }  }) => {
		const formData = await request.formData();
		const studentID = formData?.get('studentID');

		try {
			const { data, error } = await supabase.from('Student').delete().eq('id', studentID);

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
};
