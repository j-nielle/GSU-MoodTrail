<script>
	// @ts-nocheck
	import { enhance } from '$app/forms';
	import { Button, Select, Modal, FloatingLabelInput } from 'flowbite-svelte';
	import { yearLvl } from '$lib/constants/index.js';
	import { InputHelper } from '$lib/components/elements/index.js';

	export let open;
	export let handler;
	export let items;
</script>

<Modal title="Add New Student" bind:open size="xs" class="w-full">
	<form class="flex flex-col" method="POST" action="?/addStudent" use:enhance>
		{#if handler?.errors?.length > 0}
			{#each handler?.errors as error}
				{#if error.errorInput === 'existingStudent'}
					<InputHelper color="red" msg={error.error} />
				{/if}
			{/each}
		{/if}

		<div class="mb-2">
			<FloatingLabelInput
				size="small"
				style="outlined"
				name="addID"
				type="text"
				label="Student ID"
				minlength="10"
				maxlength="10"
				required
			/>
		</div>
		{#if handler?.errors?.length > 0}
			{#each handler?.errors as error}
				{#if error.errorInput === 'addID'}
					<InputHelper color="red" msg={error.error} />
				{:else if error.errorInput === 'duplicateID' || !error.errorInput === 'existingStudent'}
					<InputHelper color="red" msg={error.error} />
				{/if}
			{/each}
		{/if}

		<div class="my-2">
			<FloatingLabelInput
				size="small"
				style="outlined"
				name="addFName"
				type="text"
				label="First Name"
				required
			/>
		</div>

		<div class="my-2 space-x-4 flex justify-start">
			<div class="w-fit">
				<FloatingLabelInput
					size="small"
					style="outlined"
					name="addMName"
					type="text"
					label="Middle Initial"
					maxlength="1"
				/>
			</div>
			<div class="w-full">
				<FloatingLabelInput
					size="small"
					style="outlined"
					name="addLName"
					type="text"
					label="Last Name"
					required
				/>
			</div>
		</div>
		{#if handler?.errors?.length > 0}
			{#each handler?.errors as error}
				{#if error.errorInput === 'newName'}
					<InputHelper color="red" msg={error.error} />
				{:else if error.errorInput === 'duplicateName'}
					<InputHelper color="red" msg={error.error} />
				{/if}
			{/each}
		{/if}

		<Select size="sm" {items} class="my-2" placeholder="Select Course" name="addCourse" required />

		<div class="flex flex-row space-x-3 my-2 justify-between">
			{#each Object.keys(yearLvl) as key}
				<input
					type="radio"
					name="addYrLvl"
					value={key}
					title={yearLvl[key]}
					placeholder="Select Year"
					required
				/>
				<label class="text-sm" for="addYrLvl">{yearLvl[key]}</label>
			{/each}
		</div>

		<Button type="submit" class="w-full mt-3">Save New Student</Button>
	</form>
</Modal>
