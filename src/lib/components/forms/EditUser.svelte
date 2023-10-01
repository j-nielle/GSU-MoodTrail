<script>
	// @ts-nocheck
	import { blur } from 'svelte/transition';
	import { enhance } from '$app/forms';
	import { Card, Button, Badge, FloatingLabelInput, Helper } from 'flowbite-svelte';
	import { roles, buttonState, roleColor } from '$lib/constants/index.js';

	export let user;
	//export let handler;

	let editRole = '';
	let userID, prevUsername, prevEmail, userPass, prevRole;

	const cardClass = "p-4 h-max space-y-5 rounded bg-white dark:bg-gray-800 self-start";
	let color;

	$: if (user){
		userID = user[0]?.id;
		prevUsername = user[0]?.username;
		prevEmail = user[0]?.email;
		userPass = user[0]?.password;
		prevRole = user[0]?.role;

		color = roleColor[prevRole];
	}
</script>

<div transition:blur={{ amount: 5, duration: 150 }}>
	<Card class={cardClass} size="lg" padding="xl">
		<h3 class="font-bold text-slate-950 text-center text-xl">Edit User</h3>
		<form class="space-y-5" action="?/editUser" method="POST" use:enhance>
			<input type="hidden" id="userID" name="userID" bind:value={userID} />
			<input type="hidden" id="userPass" name="userPass" bind:value={userPass} />

			<FloatingLabelInput size="small" style="outlined" id="editUsername" name="editUsername" type="text"
				value={prevUsername} label="Username (Optional)"
			/>
			<FloatingLabelInput size="small" style="outlined" id="editEmail" name="editEmail" type="text" 
				value={prevEmail} label="Email Address"
				required
			/>

			<input type="hidden" id="editRole" name="editRole" bind:value={editRole} />

			<div class="space-y-3">
				<div class="flex flex-row space-x-2 justify-between">
					<p class="text-sm">Previous role:</p>
					<Badge border rounded {color} class="opacity-50 cursor-pointer">
						{prevRole}
					</Badge>
				</div>
				<p class="text-sm">Choose their new role:</p>
				<div class="flex flex-row space-x-2">
					{#each roles as role}
						<button type="button" on:click={() => { editRole = role.label; }}>
						<Badge class={editRole != role.label ? buttonState.inactive : buttonState.active}
							border rounded color={role.color}>
							{role.label}
						</Badge>
						</button>
					{/each}
				</div>
			</div>
			<Button pill shadow type="submit" class="w-full font-bold leading-relaxed">
				CONFIRM CHANGES
			</Button>
		</form>
	</Card>
</div>