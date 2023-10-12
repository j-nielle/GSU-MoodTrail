<script>
	import { Alert, Avatar, Card, Button, Label, Input } from 'flowbite-svelte';
	import { ShieldSolid } from 'flowbite-svelte-icons';
	import { enhance } from '$app/forms';

	export let data;
	export let form;

	$: user = data.user;
	$: username = user?.user_metadata?.username;
	$: id = user?.id;

	let changeUsername = false;
	let changePass = false;
	let changeEmail = false;
</script>

<svelte:head>
	<title>Account Settings</title>
</svelte:head>

<div class="flex space-x-4 ring-1 rounded-lg">
	<Card padding="sm" class="max-w-full">
		{#if form?.success}
			<div class="mb-4">
				<Alert color="green" class="text-center">
					<span class="font-medium">Updated succesfully!</span>
				</Alert>
			</div>
		{:else if form?.error}
			<div class="mb-4">
				<Alert color="red" class="text-center">
					<span class="font-medium">{form?.error}.</span> Please try again later.
				</Alert>
			</div>
		{/if}
		<div class="flex flex-col items-center pb-4">
			<h5 class="mb-1 text-xl font-bold text-gray-900 dark:text-white">
				{username || 'USER'}
			</h5>
			<span class="text-sm text-gray-500 dark:text-gray-400">{user?.email}, {user?.role}</span>
			<div class="flex flex-col mt-4 space-y-3 lg:mt-6">
				<Button color="dark" class="dark:text-white" on:click={() => { changeUsername = true; changeEmail = false; changePass= false; }}>
					Change Username
				</Button>
				
				<Button color="dark" class="dark:text-white" on:click={() => { changeUsername = false; changeEmail = true; changePass= false; }}>
					Change Email
				</Button> 

				<Button color="dark" class="dark:text-white" on:click={() => { changeUsername = false; changeEmail = false; changePass= true; }}>
					Change Password
				</Button>
			</div>
		</div>
	</Card>
</div>

{#if changePass}
		<Card class="sm:p-8  ring-1 rounded h-fit">
			<form class="flex flex-col space-y-5" action="?/resetPassword" method="POST" use:enhance>
				<p class="">New Password:</p>
				<Input type="password" id="newPass" name="newPass" placeholder="••••••••" required autocomplete>
					<svelte:fragment slot="left">
						<ShieldSolid tabindex="-1" size="xs" class="ml-1" />
					</svelte:fragment>
				</Input>
				<div class="flex flex-row space-x-3 justify-between mt-4">
					<Button class="w-full" color="red" on:click={() => {changePass = false}}>CANCEL</Button>
					<Button color="green" type="submit" class="w-full">RESET</Button>
				</div>
			</form>
		</Card>
{:else if changeUsername}
		<Card class="sm:p-8  ring-1 rounded h-fit">
			<form class="flex flex-col space-y-5" action="?/resetUsername" method="POST" use:enhance>
				<p class="">New Username:</p>
				<Input type="text" id="newUsername" name="newUsername" placeholder={username || 'USER'} required autocomplete>
					<svelte:fragment slot="left">
						<ShieldSolid tabindex="-1" size="xs" class="ml-1" />
					</svelte:fragment>
				</Input>
				<div class="flex flex-row space-x-3 justify-between mt-4">
					<Button class="w-full" color="red" on:click={() => {changeUsername = false}}>CANCEL</Button>
					<Button color="green" type="submit" class="w-full">RESET</Button>
				</div>
			</form>
		</Card>
{:else if changeEmail}
		<Card class="sm:p-8  ring-1 rounded h-fit">
			<form class="flex flex-col space-y-5" action="?/resetEmail" method="POST" use:enhance>
				<p class="">New Email:</p>
				<input type="hidden" id="userID" name="userID" bind:value={id} />
				<Input type="email" id="newEmail" name="newEmail" placeholder={user?.email} required autocomplete>
					<svelte:fragment slot="left">
						<ShieldSolid tabindex="-1" size="xs" class="ml-1" />
					</svelte:fragment>
				</Input>
				<div class="flex flex-row space-x-3 justify-between mt-4">
					<Button class="w-full" color="red" on:click={() => {changeEmail = false}}>CANCEL</Button>
					<Button color="green" type="submit" class="w-full">RESET</Button>
				</div>
			</form>
		</Card>
	{/if}
