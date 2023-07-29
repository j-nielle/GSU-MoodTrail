<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { newRequest } from '$lib/newRequest';
	import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper, Toast } from 'flowbite-svelte';
	import { ChartMixedSolid, PhoneSolid, BellRingSolid } from 'flowbite-svelte-icons';
	
	export let data
	$: ({ supabase } = data);

	onMount(() => {
		const toastChannel = supabase
			.channel('toast-requests')
			.on('postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				},(payload) => {
					if (payload.new) {
						newRequest.set(true);
						setTimeout(() => {
							newRequest.set(false);
						}, 8000);
					}
				}
			)
			.subscribe((status) => console.log("inside /dashboard/+layout.svelte:",status));
	
		return () => {
			toastChannel.unsubscribe();
		}
	});

	$: activeUrl = $page.url.pathname;
</script>

<div class="p-10 mt-3 bg-slate-200/20">
	<div class="flex items-stretch space-x-3">
		<Sidebar class="w-fit">
			<SidebarWrapper class="bg-white drop-shadow-lg">
				<SidebarGroup>
					<SidebarItem label="Dashboard" href="/dashboard" active={activeUrl === '/dashboard'}>
						<svelte:fragment slot="icon">
							<ChartMixedSolid />
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem label="Requests" href="/dashboard/requests" active={activeUrl === '/dashboard/requests'}>
						<svelte:fragment slot="icon">
							<PhoneSolid />
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			</SidebarWrapper>
		</Sidebar>
		<div class="flex flex-1 font-sans rounded-md border-2 border-slate-500/10 shadow-lg shadow-slate-400 bg-white">
			{#if $newRequest}
				<Toast position="top-right" simple contentClass="flex space-x-4 divide-x divide-gray-200 dark:divide-gray-700 items-center">
					<BellRingSolid class="text-blue-700" />
					<div class="pl-4">
						<span class="font-bold text-blue-700">(NEW)</span> Help request received!
					</div>
				</Toast>
			{/if}
			<slot><!-- optional fallback --></slot>
		</div>
	</div>
</div>
