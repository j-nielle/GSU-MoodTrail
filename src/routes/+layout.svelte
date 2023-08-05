<script>
	import '../app.postcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		Avatar,
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		Button,
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
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
			// @ts-ignore
			if (session != null) user = session.user;
			if (event == 'SIGNED_OUT') {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});

	$: activeUrl = $page.url.pathname;
</script>

<Navbar class="p-4 drop-shadow-lg z-50 relative">
	{#if session}
		<NavBrand href="/dashboard" class="space-x-4">
			<img src="/src/lib/img/logo-no-background.svg" alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
	{:else}
		<NavBrand href="/">
			<img src="/src/lib/img/logo-no-background.svg" alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
	{/if}

	{#if session}
		<NavUl>
			<NavLi href="/dashboard" active={activeUrl === '/dashboard'} activeClass="font-semibold text-blue-700">Dashboard</NavLi>
			<NavLi href="/dashboard/requests" active={activeUrl === '/dashboard/requests'} activeClass="font-semibold text-blue-700">Requests</NavLi>
			<NavLi href="/dashboard/student-chart" active={activeUrl === '/dashboard/student-chart'} activeClass="font-semibold text-blue-700">Student Chart</NavLi>
		</NavUl>
		<label for="avatar-menu">
			<Avatar
				class="cursor-pointer fixed"
				data-name={user?.user_metadata?.name ?? 'User'}
				id="avatar-menu"
				alt="User Profile Pic"
				border
				>{user?.user_metadata?.name ?? 'User'}
			</Avatar>
		</label>
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
	{:else}
		<div class="flex space-x-4">
			<Button href="/signup" class="bg-purple-600 hover:bg-purple-600 hover:drop-shadow-md">Register Account</Button>
			<Button href="/login" class="bg-teal-500 hover:drop-shadow-md hover:bg-teal-500">Login</Button>
		</div>
	{/if}
</Navbar>

<main>
	<slot />
</main>
