<script>
	import { blur } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { Card, Button, Badge, FloatingLabelInput, Helper } from 'flowbite-svelte';
	import { roles, buttonState } from '$lib/constants/index.js';

	let selectedRole = '';
	let message = '';

	const cardClass = "p-4 h-max space-y-5 rounded bg-white dark:bg-gray-800 self-start"
</script>

<div transition:blur={{ amount: 5, duration: 150 }}>
	<Card class={cardClass} size="lg" padding="xl">
		{#if message}
			<p>{message}</p>
		{/if}
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
			<Button pill shadow type="submit" color="purple" class="w-full font-bold leading-relaxed" >SAVE</Button>
		</form>
	</Card>
</div>