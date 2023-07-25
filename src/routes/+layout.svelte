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
			// @ts-ignore
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				/**
				 * The usage of invalidate tells sveltekit that the root `+layout.js load` function
				 * should be executed whenever the session updates to keep the page store in sync.
				 */
				invalidate('supabase:auth');
			}
			//console.log(event, session)
		});

		return () => subscription.unsubscribe();
	});
</script>

<Navbar class="mt-5">
	{#if session}
		<NavBrand href="/dashboard" class="space-x-4">
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
			<div>
				<div
					id="bell"
					class="inline-flex items-center text-sm font-medium text-center text-blue-500 hover:text-blue-600 focus:outline-none dark:hover:text-white dark:text-gray-400"
				>
					<svg
						class="w-10 h-10"
						aria-hidden="true"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path
							d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
						/></svg
					>
					<div class="flex relative">
						<div
							class="inline-flex relative -top-2 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"
						/>
					</div>
				</div>
			</div>
			<label for="avatar-menu">
				<Avatar class="cursor-pointer" id="avatar-menu" alt="User Profile Pic" />
			</label>
		{:else}
			<Button href="/register" size="sm" color="light">Create an account</Button>
			<Button href="/login" size="sm" color="dark">Login</Button>
		{/if}
	</div>
	
	<!--  subscribe to the notification store
	<Dropdown
		triggeredBy="#bell"
		class="w-full outline outline-red-500 max-w-sm rounded divide-y divide-gray-100 shadow dark:bg-gray-800 dark:divide-gray-700"
	>
		<div slot="header" class="text-center py-2 font-bold">Notifications</div>
		<DropdownItem class="flex space-x-4">
			<Avatar src="../favicon.png" dot={{ color: 'bg-gray-300' }} rounded />
			<div class="pl-3 w-full">
				<div class="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
					New message from <span class="font-semibold text-gray-900 dark:text-white">Jese Leos</span
					>: "Hey, what's up? All set for the presentation?"
				</div>
				<div class="text-xs text-primary-600 dark:text-primary-500">a few moments ago</div>
			</div>
		</DropdownItem>
		<DropdownItem class="flex space-x-4">
			<Avatar src="../favicon.png" dot={{ color: 'bg-red-400' }} rounded />
			<div class="pl-3 w-full">
				<div class="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
					<span class="font-semibold text-gray-900 dark:text-white">Joseph Mcfall</span> and
					<span class="font-medium text-gray-900 dark:text-white">5 others</span> started following you.
				</div>
				<div class="text-xs text-primary-600 dark:text-primary-500">10 minutes ago</div>
			</div>
		</DropdownItem>
		<DropdownItem class="flex space-x-4">
			<Avatar src="../favicon.png" dot={{ color: 'bg-green-400' }} rounded />
			<div class="pl-3 w-full">
				<div class="text-gray-500 text-sm mb-1.5 dark:text-gray-400">
					<span class="font-semibold text-gray-900 dark:text-white">Bonnie Green</span> and
					<span class="font-medium text-gray-900 dark:text-white">141 others</span> love your story.
					See it and view more stories.
				</div>
				<div class="text-xs text-primary-600 dark:text-primary-500">44 minutes ago</div>
			</div>
		</DropdownItem>
		<a
			slot="footer"
			href="/"
			class="block py-2 -my-1 text-sm font-medium text-center text-gray-900 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
		>
			<div class="inline-flex items-center">
				<svg
					class="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400"
					aria-hidden="true"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
					><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path
						fill-rule="evenodd"
						d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
						clip-rule="evenodd"
					/></svg
				>
				View all
			</div>
		</a>
	</Dropdown> -->

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
