<script>
	// @ts-nocheck
	import { enhance } from '$app/forms';
	import { Button, Select, Badge, FloatingLabelInput } from 'flowbite-svelte';
	import { roleChoices, roleColor } from '$lib/constants/index.js';
	import { editUser } from '$lib/stores/index.js';

	export let user;

	let userID, prevUsername, prevEmail, userPass, prevRole;

	const cardClass = "p-4 h-max w-max space-y-3 rounded bg-white self-start ring-1";
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
	<div class={cardClass}>
		<h3 class="font-bold text-slate-950 text-center text-lg my-3">Edit User</h3>
		<form class="space-y-5" action="?/editUser" method="POST" use:enhance>
			<input type="hidden" id="userID" name="userID" bind:value={userID} />
			<input type="hidden" id="userPass" name="userPass" bind:value={userPass} />

			<FloatingLabelInput size="small" style="outlined" id="editUsername" name="editUsername" type="text"
				value={prevUsername} label="Username" minlength="3" maxlength="10" required
			/>
			<FloatingLabelInput size="small" style="outlined" id="editEmail" name="editEmail" type="email" 
				value={prevEmail} label="Email Address"
				required
			/>

			<div class="flex flex-col space-y-2">
				<div class="flex flex-row justify-between">
					<p class="text-sm">Previous role:</p>
					<Badge border rounded {color} class="opacity-50 cursor-pointer">
						{prevRole}
					</Badge>
				</div>
				<Select size="sm" items={roleChoices} class="my-2" placeholder="Select New Role" value={prevRole} name="editRole" required />
			</div>
			<div class="flex space-x-3 justify-between">
				<Button size="sm" shadow type="submit" 
					color="purple" class={btnClass}>
					CONFIRM
				</Button>
				<Button size="sm" shadow color="red" 
					class={btnClass} on:click={() =>  editUser.update(() => false)}>
					CANCEL
				</Button>
			</div>
		</form>
	</div>
{/if}