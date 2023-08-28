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
		DropdownItem
	} from 'flowbite-svelte';
  import { SunSolid, MoonSolid } from 'flowbite-svelte-icons';

	export let data;

	$: ({ supabase, session } = data);

  let sessionExpired = session === null;
  
	onMount(() => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
      console.log(event)
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});

	$: activeUrl = $page.url.pathname;
</script>

<Modal bind:open={sessionExpired} size="md">
  <div class="text-center">
    <h3 class="text-lg font-normal text-gray-500 dark:text-gray-400">Session has expired.</h3>
  </div>
</Modal>

<Navbar class="!p-4 drop-shadow-sm w-full mx-auto " navDivClass="!mx-auto flex justify-between items-center w-full">
	{#if session}
		<NavBrand tabindex="-1" href="/dashboard" class="space-x-4">
			<img src="/src/lib/img/logo-no-background.svg" alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
	{:else}
		<NavBrand tabindex="-1" href="/">
			<img src="/src/lib/img/logo-no-background.svg" alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
	{/if}

	{#if session}
		<NavUl>
			<NavLi href="/dashboard" active={activeUrl === '/dashboard'} activeClass="font-semibold text-blue-700">
        Dashboard
      </NavLi>
			<NavLi href="/dashboard/requests" active={activeUrl === '/dashboard/requests'} activeClass="font-semibold text-blue-700">
        Requests
      </NavLi>
			<NavLi href="/dashboard/student-chart" active={activeUrl === '/dashboard/student-chart'} activeClass="font-semibold text-blue-700">
        Student Chart
      </NavLi>
		</NavUl>
    <!-- <DarkMode class="text-lg">
      <svelte:fragment slot="lightIcon">
        <SunSolid />
      </svelte:fragment>
      <svelte:fragment slot="darkIcon">
        <MoonSolid />
      </svelte:fragment>
    </DarkMode> -->
		<label for="avatar-menu">
			<Avatar class="cursor-pointer fixed" data-name={session?.user?.user_metadata?.name ?? 'User'}
				id="avatar-menu"
				alt="User Profile Pic"
				border
				>{session?.user?.user_metadata?.name ?? 'User'}
			</Avatar>
		</label>
		<Dropdown placement="left" triggeredBy="#avatar-menu" containerClass="z-50 drop-shadow-lg w-fit mt-8">
			<DropdownHeader>
				<span class="block text-sm"> {session?.user?.user_metadata?.name ?? 'User'} </span>
				<span class="block text-sm font-medium truncate"> {session?.user?.email} </span>
			</DropdownHeader>
			<DropdownItem class="cursor-pointer" href="/dashboard/settings/profile">Settings</DropdownItem
			>
			<DropdownDivider />
			<form method="POST" action="/logout">
				<DropdownItem type="submit" class="py-2 text-sm font-medium cursor-pointer cupx-4 hover:bg-gray-100 dark:hover:bg-gray-600">Logout</DropdownItem>
			</form>
		</Dropdown>
	{:else}
		<div class="flex space-x-4">
			<Button href="/register" color="alternative" class="hover:text-gray-900 focus:text-gray-900">Register Account</Button>
			<Button href="/login" color="purple" class="">Login</Button>
		</div>
	{/if}
</Navbar>

<main>
	<slot />
</main>
