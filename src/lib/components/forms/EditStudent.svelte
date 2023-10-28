<script>
	// @ts-nocheck
	import { enhance } from '$app/forms';
	import { Button, Select, Modal, FloatingLabelInput } from 'flowbite-svelte';
	import { yearLvl } from '$lib/constants/index.js';
	import { InputHelper } from '$lib/components/elements/index.js';

	export let open;
	export let handler;
	export let items;
	export let student;

	let prevID, prevFName, prevMName, prevLName, prevYrLvl, prevCourse;

	$: if (student) {
		const fullName = student[0]?.name.split(' ');
		const prevMIndex = fullName.findIndex((part) => part.length === 2 && part.includes('.'));

		prevID = student[0]?.id;
		prevFName = fullName.slice(0, prevMIndex).join(' ');
		prevMName = fullName[prevMIndex];
		prevLName = fullName.slice(prevMIndex + 1).join(' ');
		prevYrLvl = student[0]?.year_level_id;
		prevCourse = student[0]?.course_id;
	}
</script>

<Modal title="Edit Student Data" bind:open size="xs" class="max-w-xl">
	<form class="flex flex-col" method="POST" action="?/editStudent" use:enhance>
		{#if handler?.errors?.length > 0}
			{#each handler?.errors as error}
				{#if error.errorInput === 'prevStudentData'}
					<InputHelper color="red" msg={error.error} />
				{/if}
			{/each}
		{/if}

		<div class="mb-2">
			<FloatingLabelInput
				size="small"
				style="outlined"
				name="editID"
				type="text"
				value={prevID}
				label="Student ID"
				minlength="10"
				maxlength="10"
				required
			/>
		</div>
		{#if handler?.errors?.length > 0}
			{#each handler?.errors as error}
				{#if error.errorInput === 'editID'}
					<InputHelper color="red" msg={error.error} />
				{/if}
			{/each}
		{/if}

		<div class="my-2">
			<FloatingLabelInput
				size="small"
				style="outlined"
				name="editFName"
				type="text"
				value={prevFName}
				label="First Name"
				minlength="3"
				required
			/>
		</div>

		<div class="my-2 space-x-4 flex justify-start">
			<div class="w-fit">
				<FloatingLabelInput
					size="small"
					style="outlined"
					name="editMName"
					type="text"
					value={prevMName}
					label="Middle Initial"
					maxlength="1"
				/>
			</div>
			<div class="w-full">
				<FloatingLabelInput
					size="small"
					style="outlined"
					name="editLName"
					type="text"
					value={prevLName}
					label="Last Name"
					minlength="3"
					required
				/>
			</div>
		</div>
		{#if handler?.errors?.length > 0}
			{#each handler?.errors as error}
				{#if error.errorInput === 'editID'}
					<InputHelper color="red" msg={error.error} />
				{/if}
			{/each}
		{/if}

		<Select
			size="sm"
			{items}
			class="my-2"
			placeholder="Select Course"
			value={prevCourse}
			name="editCourse"
			required
		/>

		<p class="text-sm my-2">
			Previous Year Level: <span class="font-semibold text-orange-500">{yearLvl[prevYrLvl]}</span>
		</p>
		<div class="flex flex-row space-x-3 my-2 justify-between">
			{#each Object.keys(yearLvl) as key}
				<label class="text-sm" for={`editYrLvl_${key}`}>
					<input type="radio" name="editYrLvl" value={key} id={`editYrLvl_${key}`} required />
					{yearLvl[key]}
				</label> 
			{/each}
		</div>

		<Button type="submit" class="w-full mt-3">Update Student</Button>
	</form>
</Modal>
