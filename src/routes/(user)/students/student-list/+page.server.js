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

		let errors = [];

		if(newMName === null || newMName === undefined || newMName === '') {
			newName = `${newFName} ${newLName}`.trim().toUpperCase();
		}
		else if(newMName.startsWith('.')) {
			errors.push({
				errorInput: 'InvalidMiddleInitial',
				error: 'Invalid middle initial, please exit and try again.'
			});
		}
		else{
			newName = `${newFName} ${newMName}. ${newLName}`.trim().toUpperCase();
		}
		
		if((/[^0-9]/.test(newID))){
			errors.push({
				errorInput: 'NonNumericID',
				error: 'Valid ID number (e.g 2020303123), please exit and try again.'
			});
		}
		else if(newID?.slice(0, 3) != '202'){
			errors.push({
				errorInput: 'InvalidIDNum',
				error: 'Valid ID number (e.g 2020303123), please exit and try again.'
			});
		}
		else if (newName?.length < 5 || /\d/.test(newName)) {
			errors.push({
				errorInput: 'InvalidName',
				error: 'Invalid name, please exit and try again.'
			});
		}
		else {
			try {
				const { data: existingStudent, error } = await supabase
					.from('Student')
					.select('*')
					.eq('student_id', newID)
					.eq('name', newName)
					.eq('year_level_id', newYearLevel)
					.eq('course_id', newCourse);
	
				if (existingStudent.length > 0) {
					errors.push({
						errorInput: 'existingStudent',
						error: 'Student already exists, please exit and try again.'
					});
				} else {
					const { data, error } = await supabase
						.from('Student')
						.insert([
							{
								student_id: newID,
								name: newName,
								year_level_id: newYearLevel,
								course_id: newCourse
							}
						])
						.select();
	
					if (error) {
						console.error(error);
						if (error.message == 'duplicate key value violates unique constraint "student_id_key"') {
							errors.push({
								errorInput: 'duplicateID',
								error: 'Student ID already exists, please exit and try again.'
							});
						}
						else if(error.message == 'duplicate key value violates unique constraint "Student_name_key"' 
							|| error.message == 'duplicate key value violates unique constraint "name_unique"') 
						{
							errors.push({
								errorInput: 'duplicateName',
								error: 'Student name already exists, please exit and try again.'
							});
						}
					}
				}
			} catch (error) {
				console.error(error);
			}
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
		
		const studentRow = formData.get('studentRow');
		const editID = formData.get('editID');
		const editFName = formData.get('editFName');
		let editMName = formData.get('editMName');
		const editLName = formData.get('editLName');
		const editCourse = formData.get('editCourse');
		const editYearLevel = formData.get('editYrLvl');

		let errors = [];

		let editName = '';
		
		if(/[0-9]/.test(editMName)){
			errors.push({
				errorInput: 'NumericMiddleInitial',
				error: 'Invalid middle initial, please try again.'
			});
			editMName = '';
		}
		else if (editMName.startsWith('.')) {
			errors.push({
				errorInput: 'InvalidMiddleInitial',
				error: 'Invalid middle initial, please try again.'
			});
			editMName = '';
		}

		if(editMName === null || editMName === undefined || editMName === '') {
			editName = `${editFName} ${editLName}`.trim().toUpperCase();
		}
		else{
			editName = `${editFName} ${editMName}. ${editLName}`.trim().toUpperCase();
		}

		if(/[^0-9]/.test(editID)){
			errors.push({
				errorInput: 'NonNumericID',
				error: 'Valid ID number (e.g 2020303123), please exit and try again.'
			});
		}
		else if(editID?.slice(0, 3) != '202'){
			errors.push({
				errorInput: 'InvalidIDNum',
				error: 'Valid ID number (e.g 2020303123), please exit and try again.'
			});
		}
		else if (editName?.length < 5 || /\d/.test(editName)) {
			errors.push({
				errorInput: 'InvalidName',
				error: 'Entered invalid name, please exit and try again.'
			});
		}
		else {
			try {
				const { data: prevStudentData, error } = await supabase
					.from('Student')
					.select('*')
					.eq('student_id', editID)
					.eq('name', editName)
					.eq('year_level_id', editYearLevel)
					.eq('course_id', editCourse);
				if (prevStudentData?.length > 0) {
					errors.push({
						errorInput: 'prevStudentData',
						error: 'No changes made. Please exit and try again.'
					});
				} 
				else if (error) {
					console.error(error);
					errors.push({
						errorInput: 'error',
						error: error.message
					});
				}
				else {
					const { data, error } = await supabase
						.from('Student')
						.update({
							student_id: editID,
							name: editName,
							year_level_id: editYearLevel,
							course_id: editCourse
						})
						.eq('id', studentRow)
						.select();
					if (error) {
						console.error(error);
						errors.push({
							errorInput: 'error',
							error: error.message
						});
					}
				}
			} catch (error) {
				console.error(error);
				errors.push({
					errorInput: 'error',
					error: error.message
				});
			}
		}

		if (errors?.length > 0) {
			return {
				errors: errors,
				success: false
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
			const { data, error } = await supabase.from('Student').delete().eq('student_id', studentID);

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
