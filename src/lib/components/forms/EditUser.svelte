<script>
	// @ts-nocheck
	import { enhance } from '$app/forms';
	import { Card, Button, Badge, FloatingLabelInput } from 'flowbite-svelte';
	import { roles, buttonState, roleColor } from '$lib/constants/index.js';
	import { editUser } from '$lib/stores/index.js';

	export let user;

	let editRole = '';
	let userID, prevUsername, prevEmail, userPass, prevRole;

	const cardClass = "p-4 h-max w-max space-y-5 rounded bg-white dark:bg-gray-800 self-start";
	const btnClass = "w-full font-bold leading-relaxed"
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

{#if $editUser}
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
			<div class="flex space-x-3 justify-between">
				<Button size="sm" pill shadow type="submit" color="purple" class={btnClass}>CONFIRM</Button>
				<Button size="sm" pill shadow color="red" class={btnClass} on:click={() =>  editUser.update(() => false)}>CANCEL</Button>
			</div>
		</form>
	</Card>
{/if}