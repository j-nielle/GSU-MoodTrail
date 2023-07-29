<script>
	import '../app.postcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		Avatar,
		Navbar,
		NavBrand,
		Button,
		Dropdown,
		DropdownDivider,
		DropdownHeader,
		DropdownItem
	} from 'flowbite-svelte';

	export let data;

	$: ({ supabase, session } = data);

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			// if (_session?.expires_at !== session?.expires_at) {
			// 	invalidate('supabase:auth');
			// } else 
			if (event === 'TOKEN_REFRESHED') {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<Navbar class="mt-5">
	{#if session}
		<NavBrand href="/dashboard" class="space-x-4">
			<p class="text-2xl">MoodTrail BETA</p>
		</NavBrand>
	{:else}
		<NavBrand href="/">
			<p class="text-2xl">MoodTrail BETA</p>
		</NavBrand>
	{/if}

	<div class="flex space-x-3 md:order-2">
		{#if session}
			<label for="avatar-menu">
				<Avatar
					class="cursor-pointer"
					data-name={session?.user?.user_metadata?.name}
					id="avatar-menu"
					alt="User Profile Pic"
					border>{session?.user?.user_metadata?.name}
				</Avatar>
			</label>
			<Dropdown placement="bottom" triggeredBy="#avatar-menu">
				<DropdownHeader>
					<span class="block text-sm"> {session?.user?.user_metadata?.name} </span>
					<span class="block text-sm font-medium truncate"> {session?.user?.email} </span>
				</DropdownHeader>
				<DropdownItem class="cursor-pointer" href="/dashboard/settings/profile">Settings</DropdownItem>
				<DropdownDivider />
				<form method="POST" action="/logout">
					<DropdownItem	type="submit" class="py-2 text-sm font-medium cursor-pointer cupx-4 hover:bg-gray-100 dark:hover:bg-gray-600">
						Logout
					</DropdownItem>
				</form>
			</Dropdown>
		{:else}
			<Button href="/register" size="sm" color="light">Create an account</Button>
			<Button href="/login" size="sm" color="dark">Login</Button>
		{/if}
	</div>
</Navbar>

<slot />
