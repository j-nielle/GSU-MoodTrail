<script>
	// @ts-nocheck
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		Alert,
		Button,
		P,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Search
	} from 'flowbite-svelte';
	import { yearLvl } from '$lib/constants/index.js';
	import { AddStudent, EditStudent } from '$lib/components/forms/index.js';
	import {
		ChevronLeftSolid,
		ChevronRightSolid,
		EditOutline,
		TrashBinSolid
	} from 'flowbite-svelte-icons';

	export let data;
	export let form;

	$: ({ supabase } = data);

	let studentsData = data.students;
	let courses = data.courses;

	let searchTerm = '';
	let filteredItems;
	let currentPage = 1;
	let limit = 5;
	let maxPage, startIndex, endIndex, paginatedItems;

	let selectCourse = courses?.map((item) => ({
		value: item.course_id,
		name: item.course
	}));

	let rowToUpdate;

	let addStudentModal = false;
	let editStudentModal = false;

	let addAlert = false,
		updateAlert = false,
		deleteAlert = false;
	let errors = [];

	onMount(() => {
		const studentsDataChannel = supabase
			.channel('schema-db-changes')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'Student'
				},
				(payload) => {
					console.log(payload.eventType);
					if (payload.eventType === 'INSERT') {
						addAlert = true;

						setTimeout(() => {
							addAlert = false;
						}, 2000);

						studentsData = _.cloneDeep([payload.new, ...studentsData]).sort((a, b) =>
							a.name.localeCompare(b.name)
						);
					} else if (payload.eventType === 'UPDATE') {
						updateAlert = true;

						setTimeout(() => {
							updateAlert = false;
						}, 2000);

						// payload.new returns updated row, payload.old returns property "id" of updated row
						const updatedIndex = studentsData.findIndex((student) => student.id === payload.old.id);

						if (updatedIndex !== -1) {
							studentsData[updatedIndex] = payload.new;
						}

						studentsData = _.cloneDeep(studentsData).sort((a, b) => a.name.localeCompare(b.name));
					} else if (payload.eventType === 'DELETE') {
						deleteAlert = true;

						setTimeout(() => {
							deleteAlert = false;
						}, 2000);

						// payload.old returns property "id" of deleted row
						const updatedStudentsData = studentsData.filter(
							(student) => student.id !== payload.old.id
						);
						studentsData = updatedStudentsData;
					}
				}
			)
			.subscribe((status) => console.log($page.url.pathname, status));

		return () => {
			studentsDataChannel.unsubscribe();
		};
	});

	$: if (studentsData) {
		filteredItems = studentsData?.filter((req) => {
			const idMatch = req.id.toString().includes(searchTerm);
			const nameMatch = req.name.toLowerCase().includes(searchTerm.toLowerCase());
			const courseMatch = req.course_id.toLowerCase().includes(searchTerm.toLowerCase());
			const yearLevelMatch = req.year_level_id
				.toString()
				.toLowerCase()
				.includes(searchTerm.toLowerCase());

			return searchTerm !== '' ? idMatch || nameMatch || courseMatch || yearLevelMatch : true;
		});

		startIndex = (currentPage - 1) * limit;
		endIndex = startIndex + limit;
		maxPage = Math.ceil(filteredItems?.length / limit);
		paginatedItems = filteredItems?.slice(startIndex, endIndex);
	}

	$: if (form?.errors) {
		errors = form?.errors;
	}

	function changePage(newPage) {
		if (newPage >= 1 && newPage <= maxPage) {
			currentPage = newPage;
		}
	}

	async function handleRemove(student_id) {
		const rowToDelete = studentsData.filter((student) => student.id == student_id);

		try {
			const { error } = await supabase.from('Student').delete().eq('id', rowToDelete[0].id);
			console.log(error);
		} catch (error) {
			console.log(error);
		}
	}

	function handleUpdate(student_id) {
		editStudentModal = true;
		rowToUpdate = studentsData.filter((student) => student.id == student_id);
	}
</script>

<svelte:head>
	<title>Student List</title>
</svelte:head>

<div class="bg-white space-y-3 mt-5">
	{#if deleteAlert}
		<Alert color="red" class="mx-8 mb-4">
			<span class="font-medium">Student has been removed!</span>
			Change a few things up and try submitting again.
		</Alert>
	{:else if addAlert}
		<Alert color="green" class="mx-8 mb-4">
			<span class="font-medium">New Student detected!</span>
			Change a few things up and try submitting again.
		</Alert>
	{:else if updateAlert}
		<Alert color="purple" class="mx-8 mb-4">
			<span class="font-medium">Student data changes detected!</span>
			Change a few things up and try submitting again.
		</Alert>
	{/if}
	<div class="flex justify-between">
		<div class="space-x-3 flex flex-row">
			<div class="flex gap-2 ml-8">
				<Search
					size="md"
					class="w-96 h-11 bg-white"
					placeholder="Search by ID, Name, Year Level, Course"
					bind:value={searchTerm}
				/>
			</div>
		</div>
		<Button
			class="h-11 mr-7"
			size="sm"
			color="green"
			on:click={() => {
				addStudentModal = true;
				errors = [];
			}}>Add New Student</Button
		>
	</div>

	<div class="ml-4-6 ml-4 mb-7 mr-11">
		<div class="flex justify-between ml-4">
			<P
				class="text-lg mt-3 font-bold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800 mb-6"
			>
				List of Students
				<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
					Click a [<span class="font-bold">Student's ID</span>] to view more about their student
					information.
				</p>
			</P>
			{#if maxPage > 1}
				<div class="flex flex-row items-center justify-center space-x-2">
					<div class="flex text-sm text-center text-gray-700 dark:text-gray-400">
						<span class="font-semibold text-gray-900 dark:text-white"
							>{currentPage} <span class="font-normal">of</span> {maxPage}</span
						>
					</div>
					<div class="flex space-x-2">
						<ChevronLeftSolid
							class="cursor-pointer focus:outline-0"
							on:click={() => changePage(currentPage - 1)}
						/>
						<ChevronRightSolid
							class="cursor-pointer focus:outline-0"
							on:click={() => changePage(currentPage + 1)}
						/>
					</div>
				</div>
			{/if}
		</div>

		<Table divClass="w-full text-left text-sm text-gray-500 dark:text-gray-400 ml-4">
			<TableHead class="border border-zinc-300 text-center">
				<TableHeadCell>Student ID</TableHeadCell>
				<TableHeadCell>Full Name</TableHeadCell>
				<TableHeadCell>Year Level</TableHeadCell>
				<TableHeadCell>Course</TableHeadCell>
				<TableHeadCell>Edit</TableHeadCell>
				<TableHeadCell>Remove</TableHeadCell>
			</TableHead>
			<TableBody tableBodyClass="divide-y border border-zinc-300 max-h-40 overflow-y-auto">
				{#if paginatedItems === undefined || paginatedItems?.length === 0}
					<TableBodyRow class="text-center">
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
					</TableBodyRow>
				{:else}
					{#each paginatedItems as student}
						<TableBodyRow class="text-center">
							<TableBodyCell>
								<a
									class="hover:underline"
									href="/dashboard/student-chart?search={student.id}"
									rel="noopener noreferrer"
								>
									{student.id}
								</a>
							</TableBodyCell>
							<TableBodyCell>{student.name}</TableBodyCell>
							<TableBodyCell>{yearLvl[student.year_level_id]}</TableBodyCell>
							<TableBodyCell>{student.course_id}</TableBodyCell>
							<TableBodyCell>
								<div class="flex justify-center cursor-pointer">
									<EditOutline
										class="text-purple-600 focus:outline-none hover:text-green-700"
										on:click={handleUpdate(student.id)}
									/>
								</div>
							</TableBodyCell>
							<TableBodyCell>
								<div class="flex justify-center cursor-pointer">
									<TrashBinSolid
										class="text-red-600 focus:outline-none hover:text-red-700"
										on:click={handleRemove(student.id)}
									/>
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</div>
</div>

<AddStudent bind:open={addStudentModal} bind:handler={form} bind:items={selectCourse} />
<EditStudent
	bind:open={editStudentModal}
	bind:handler={form}
	bind:items={selectCourse}
	student={rowToUpdate}
/>
