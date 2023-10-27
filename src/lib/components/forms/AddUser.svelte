<script>
	// @ts-nocheck
	import { enhance } from '$app/forms';
	import { Card, Button, Badge, FloatingLabelInput } from 'flowbite-svelte';
	import { roles, buttonState } from '$lib/constants/index.js';
	import { addNewUser } from '$lib/stores/index.js';

	let selectedRole = '';

	const cardClass = "p-4 h-max w-max space-y-5 rounded bg-white dark:bg-gray-800 self-start"
	const btnClass = "w-full font-bold leading-relaxed"
</script>

{#if $addNewUser}
	<Card class={cardClass} size="lg" padding="xl">
		<h3 class="font-bold text-slate-950 text-center text-xl">Add New User</h3>
		<form class="space-y-5" action="?/newUser" method="POST" use:enhance>
			<FloatingLabelInput size="small" style="outlined" id="addName" name="addName" type="text"
				label="Username (Optional)"
			/>
			<FloatingLabelInput size="small" style="outlined" id="addEmail" name="addEmail" type="text" 
				label="Email Address"
				required
			/>
			<FloatingLabelInput size="small" style="outlined" id="addPassword" name="addPassword" type="password"
				label="Password"
				autocomplete
				required
			/>
			<input type="hidden" id="addRole" name="addRole" bind:value={selectedRole} />

			<div class="space-y-3">
				<p class="text-sm">Choose their role:</p>
				<div class="flex flex-row space-x-2">
					{#each roles as role}
						<button type="button" on:click={() => { selectedRole = role.label; }}>
						<Badge class={selectedRole != role.label ? buttonState.inactive : buttonState.active}
							border rounded color={role.color}>
							{role.label}
						</Badge>
						</button>
					{/each}
				</div>
			</div>
			<div class="flex space-x-3 justify-between">
				<Button size="sm" pill shadow type="submit" color="purple" class={btnClass}>SAVE</Button>
				<Button size="sm" pill shadow color="red" class={btnClass} on:click={() =>  addNewUser.update(() => false)}>CANCEL</Button>
			</div>
		</form>
	</Card>
{/if}