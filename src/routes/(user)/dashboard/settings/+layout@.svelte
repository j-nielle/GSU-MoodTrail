<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Toast, Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	import { newRequest } from '$lib/newRequest';
	import { BellRingSolid } from 'flowbite-svelte-icons';

	export let data

	$: ({ supabase } = data);

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
						newRequest.set(true);
						setTimeout(() => {
							newRequest.set(false);
						}, 8000);
					}
				}
			)
			.subscribe((status) => console.log("inside /dashboard/settings/+layout.svelte:",status));
	
		return () => {
			toastChannelTwo.unsubscribe();
		}
	});

	let spanClass =
		'flex items-center p-2 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700';

	$: activeUrl = $page.url.pathname;
</script>

{#if $newRequest}
	<Toast position="top-right" simple contentClass="flex space-x-4 divide-x divide-gray-200 dark:divide-gray-700 items-center">
		<span tabindex="-1"><BellRingSolid class="text-blue-700" /></span>
		<div class="pl-4">
			<span class="font-bold text-blue-700">(NEW)</span> Help request received!
		</div>
	</Toast>
{/if}

<div class="p-10">
	<div class="flex items-stretch space-x-3">
		<Sidebar>
			<SidebarWrapper class="bg-white drop-shadow-lg ring-1 h-screen">
				<SidebarGroup>
					<SidebarItem
						label="Profile Settings"
						href="/dashboard/settings/profile"
						activeClass={spanClass}
						active={activeUrl === '/dashboard/settings/profile'} />
					<SidebarItem
						label="Account Settings"
						href="/dashboard/settings/account"
						activeClass={spanClass}
						active={activeUrl === '/dashboard/settings/account'} />
					<SidebarItem
						label="Security"
						href="/dashboard/settings/security"
						activeClass={spanClass}
						active={activeUrl === '/dashboard/settings/security'}	/>
				</SidebarGroup>
			</SidebarWrapper>
		</Sidebar>
	</div>
</div>

<slot />