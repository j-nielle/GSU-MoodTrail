<script>
	// @ts-nocheck
	import '../app.postcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		Avatar,
		DarkMode,
		Modal,
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		Button,
		Dropdown,
		DropdownDivider,
		DropdownHeader,
		DropdownItem,
		MegaMenu
	} from 'flowbite-svelte';
	import { ChevronDownOutline } from 'flowbite-svelte-icons';

	export let data;

	$: ({ supabase, session } = data);

	let sessionExpired = session === null;
	let studentsMenu = [
		{ name: 'List of Students', href: '/dashboard/all-students' },
		{ name: 'Visualizations', href: '/dashboard/student-chart' }
	];

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			console.log(event);
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});

	$: activeUrl = $page.url.pathname;
</script>

<Navbar
	class="!p-4 drop-shadow-sm w-full mx-auto relative"
	navDivClass="!mx-auto flex justify-between items-center w-full !z-50"
>
	{#if session}
		<NavBrand tabindex="-1" href="/dashboard" class="ml-3">
			<img src="static/logo-no-background.svg" alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
	{:else}
		<NavBrand tabindex="-1" href="/" class="ml-3">
			<img src="static/logo-no-background.svg" alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
	{/if}

	{#if session}
		<NavUl>
			<NavLi
				href="/dashboard"
				active={activeUrl === '/dashboard'}
				activeClass="font-semibold text-blue-700"
			>
				Dashboard
			</NavLi>
			<NavLi
				href="/dashboard/requests"
				active={activeUrl === '/dashboard/requests'}
				activeClass="font-semibold text-blue-700"
			>
				Requests
			</NavLi>
			<NavLi id="student-menu" class="cursor-pointer">
				Students<ChevronDownOutline
					class="w-3 h-3 ml-2 text-primary-800 dark:text-white inline focus:outline-0"
				/>
			</NavLi>
			<Dropdown triggeredBy="#student-menu" class="w-36 items-center z-20">
				<DropdownItem href="/dashboard/all-students">List of Students</DropdownItem>
				<DropdownItem href="/dashboard/student-chart">Info and Charts</DropdownItem>
			</Dropdown>
		</NavUl>

		<label for="avatar-menu">
			<Avatar
				class="cursor-pointer fixed mr-3"
				data-name={session?.user?.user_metadata?.name ?? 'User'}
				id="avatar-menu"
				alt="User Profile Pic"
				border
				>{session?.user?.user_metadata?.name ?? 'User'}
			</Avatar>
		</label>
		<Dropdown
			class="z-40 relative"
			placement="left"
			triggeredBy="#avatar-menu"
			containerClass="z-50 drop-shadow-lg w-fit mt-8"
		>
			<DropdownHeader>
				<span class="block text-sm"> {session?.user?.user_metadata?.name ?? 'User'} </span>
				<span class="block text-sm font-medium truncate"> {session?.user?.email} </span>
			</DropdownHeader>
			<DropdownItem class="cursor-pointer" href="/dashboard/settings/account">Settings</DropdownItem
			>
			<DropdownDivider />
			<form method="POST" action="/logout">
				<DropdownItem
					type="submit"
					class="py-2 text-sm font-medium cursor-pointer cupx-4 hover:bg-gray-100 dark:hover:bg-gray-600"
					>Logout</DropdownItem
				>
			</form>
		</Dropdown>
	{:else}
		<div class="flex space-x-4">
			<Button href="/login" color="purple" class="mr-3">Login</Button>
		</div>
	{/if}
</Navbar>

<main class="">
	<slot />
</main>
