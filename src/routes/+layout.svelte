<script>
	import '../app.postcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import {
		Avatar,
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		Button,
		DarkMode,
		Dropdown,
		DropdownDivider,
		DropdownHeader,
		DropdownItem
	} from 'flowbite-svelte';

	export let data;

	let user = {};
	let placement = 'left';

	$: ({ supabase, session } = data);

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, session) => {
			// @ts-ignore
			if (session != null) user = session.user;
			if (event == 'SIGNED_OUT') {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<Navbar class="p-6 drop-shadow-lg z-50 relative">
	{#if user}
		<NavBrand href="/dashboard" class="space-x-4">
			<img src="/src/lib/img/logo-no-background.svg" alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
	{:else}
		<NavBrand href="/">
			<img src="/src/lib/img/logo-no-background.svg" alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
	{/if}

	{#if user}
		<NavUl>
			<NavLi>Requests</NavLi>
			<NavLi>Individual Charts</NavLi>
		</NavUl>
	{/if}

	{#if user}
		<label for="avatar-menu">
			<Avatar
				class="cursor-pointer"
				data-name={user?.user_metadata?.name ?? 'User'}
				id="avatar-menu"
				alt="User Profile Pic"
				border
				>{user?.user_metadata?.name ?? 'User'}
			</Avatar>
		</label>
	{:else}
		<Button href="/register" size="sm" color="light">Register</Button>
		<Button href="/login" size="sm" color="blue">Login</Button>
	{/if}
	
	<Dropdown {placement} 
		triggeredBy="#avatar-menu" 
		containerClass="drop-shadow-lg w-fit mt-8">		
		<DropdownHeader>
			<span class="block text-sm"> {user?.user_metadata?.name ?? 'User'} </span>
			<span class="block text-sm font-medium truncate"> {user?.email} </span>
		</DropdownHeader>
		<DropdownItem class="cursor-pointer" href="/dashboard/settings/profile">Settings</DropdownItem>
		<DropdownDivider />
		<form method="POST" action="/logout">
			<DropdownItem type="submit" class="py-2 text-sm font-medium cursor-pointer cupx-4 hover:bg-gray-100 dark:hover:bg-gray-600">Logout</DropdownItem>
		</form>
	</Dropdown>
</Navbar>

<main>
	<slot />
</main>
