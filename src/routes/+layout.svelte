<script>
	import '../app.postcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		Avatar,
		Navbar,
		NavBrand,
		Button,
		DarkMode,
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
			if (event === 'TOKEN_REFRESHED') {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<Navbar class="p-8">
	{#if session}
		<NavBrand href="/dashboard" class="space-x-4">
			<img src="/src/lib/img/logo-no-background.svg" alt="Placeholder Logo" class="w-32 h-fit">
		</NavBrand>
	{:else}
		<NavBrand href="/">
			<img src="/src/lib/img/logo-no-background.svg" alt="Placeholder Logo" class="w-32 h-fit">
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
			<Button href="/register" size="sm" color="light">Register</Button>
			<Button href="/login" size="sm" color="blue">Login</Button>
		{/if}
	</div>
</Navbar>

<slot>
</slot>
