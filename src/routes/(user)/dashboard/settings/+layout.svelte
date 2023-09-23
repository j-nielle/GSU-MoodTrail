<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Toast, Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	import { newRequest } from '$lib/stores/index.js';
	import {
		BellRingSolid,
		DatabaseSolid,
		UserCircleOutline,
		UserEditOutline,
		UserSettingsOutline
	} from 'flowbite-svelte-icons';

	export let data;

	$: ({ supabase, session } = data);

	onMount(() => {
		const toastChannelTwo = supabase
			.channel('toast-requests-2')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				},
				(payload) => {
					if (payload.new) {
						newRequest.update(() => true);
						setTimeout(() => {
							newRequest.set(false);
						}, 8000);
					}
				}
			)
			.subscribe((status) => console.log('inside /dashboard/settings/+layout.svelte:', status));

		return () => {
			toastChannelTwo.unsubscribe();
		};
	});

	let spanClass =
		'flex items-center p-2 text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700';

	$: activeUrl = $page.url.pathname;
</script>

{#if $newRequest}
	<Toast
		position="top-right"
		simple
		contentClass="flex space-x-4 divide-x divide-gray-200 dark:divide-gray-700 items-center"
	>
		<span tabindex="-1"><BellRingSolid /></span>
		<div class="pl-4">
			<span class="font-bold text-blue-700">(NEW)</span> Help request received!
		</div>
	</Toast>
{/if}
<div class="p-4 bg-zinc-50 flex space-x-3 overflow-x-hidden">
	<Sidebar class="w-fit">
		<SidebarWrapper class="bg-white drop-shadow-lg ring-1 h-fit w-32 flex p-3 justify-center">
			<SidebarGroup>
				<SidebarItem
					class="text-sm rounded"
					label="Account"
					href="/dashboard/settings/account"
					activeClass={spanClass}
					active={activeUrl === '/dashboard/settings/account'}
				>
					<svelte:fragment slot="icon">
						<UserEditOutline />
					</svelte:fragment>
				</SidebarItem>
				{#if session?.user.role === 'admin'}
					<SidebarItem
						class="text-sm rounded"
						label="Users"
						href="/dashboard/settings/manage-users"
						activeClass={spanClass}
						active={activeUrl === '/dashboard/settings/manage-users'}
					>
						<svelte:fragment slot="icon">
							<DatabaseSolid />
						</svelte:fragment>
					</SidebarItem>
				{/if}
			</SidebarGroup>
		</SidebarWrapper>
	</Sidebar>
	<slot />
</div>
