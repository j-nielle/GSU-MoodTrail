<script>
	import '../app.postcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getImageURL } from '$lib/utils';
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
			if (_session?.expires_at !== session?.expires_at) {
				/**
				 * The usage of invalidate tells sveltekit that the root `+layout.ts load` function
				 * should be executed whenever the session updates to keep the page store in sync.
				 */
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<!-- <nav>
	<div>
		{#if session}
			<h1>Welcome, {session.user.email}!</h1>
			<form method="POST" action="/logout">
				<button type="submit" class="bg-red-500 p-3">Logout</button>
			</form>
		{:else}
			<button class="bg-purple-500 p-3"><a href="/register">Create an account</a></button>
			<button class="bg-blue-500 p-3"><a href="/login">Login</a></button>
		{/if}
	</div>
</nav> -->

<Navbar class="mt-5">
	{#if session}
		<NavBrand href="/dashboard">
			<p class="text-2xl">MoodTrail BETA</p>
			<!-- <img src="../logo-no-background.svg" class="h-6 mr-3 sm:h-9" alt="Placeholder" /> -->
		</NavBrand>
	{:else}
		<NavBrand href="/">
			<p class="text-2xl">MoodTrail BETA</p>
			<!-- <img src="../../logo-no-background.svg" class="h-6 mr-3 sm:h-9" alt="Placeholder" /> -->
		</NavBrand>
	{/if}
	<div class="flex space-x-3 md:order-2">
		{#if session}
			<!-- <Avatar
			class="cursor-pointer"
			id="avatar-menu"
			src={data?.user?.avatar
				? getImageURL(data.user?.collectionId, data.user?.id, data.user?.avatar)
				: `https://avatars.dicebear.com/api/initials/${data.name}.svg`}
			alt="User Profile Pic"
		/> -->
			<label for="avatar-menu">
				<Avatar
					class="cursor-pointer outline outline-red-600"
					id="avatar-menu"
					alt="User Profile Pic"
				/>
			</label>
		{:else}
			<Button href="/register" size="sm" color="light">Create an account</Button>
			<Button href="/login" size="sm" color="dark">Login</Button>
		{/if}
	</div>
	<Dropdown placement="bottom" triggeredBy="#avatar-menu">
		<DropdownHeader>
			<span class="block text-sm"> {session?.user?.user_metadata?.name} </span>
			<span class="block text-sm font-medium truncate"> {session?.user?.email} </span>
		</DropdownHeader>
		<DropdownItem class="cursor-pointer" href="/dashboard/settings/profile">Settings</DropdownItem>
		<DropdownDivider />
		<form method="POST" action="/logout">
			<DropdownItem
				type="submit"
				class="py-2 text-sm font-medium cursor-pointer cupx-4 hover:bg-gray-100 dark:hover:bg-gray-600"
				>Logout</DropdownItem
			>
		</form>
	</Dropdown>
</Navbar>

<slot />
