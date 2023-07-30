<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { newRequest } from '$lib/newRequest';
	import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper, Toast } from 'flowbite-svelte';
	import { ChartPieOutline, PhoneOutline, BellRingSolid } from 'flowbite-svelte-icons';
	
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

<div class="p-4 bg-slate-200/20 outline outline-yellow-500  outline-1">
	<div class="flex">
		<Sidebar class="w-auto mr-7">
			<SidebarWrapper class="bg-white drop-shadow-lg w-fit">
				<SidebarGroup class="space-y-4">
					<SidebarItem class="flex-col" href="/dashboard" active={activeUrl === '/dashboard'}>
						<svelte:fragment slot="icon" >
							<ChartPieOutline class="outline-none text-blue-700" />
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem class="flex-col" href="/dashboard/requests" active={activeUrl === '/dashboard/requests'}>
						<svelte:fragment slot="icon">
							<PhoneOutline class="outline-none text-blue-700" />
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			</SidebarWrapper>
		</Sidebar>
		<div class="font-sans outline outline-1 rounded-md border-2 border-slate-500/10 shadow-lg shadow-slate-400 bg-white items-center">
			{#if $newRequest}
				<Toast position="top-right" simple contentClass="flex space-x-4 divide-x divide-gray-200 dark:divide-gray-700 items-center">
					<BellRingSolid class="text-blue-700" />
					<div class="pl-4">
						<span class="font-bold text-blue-700">(NEW)</span> Help request received!
					</div>
				</Toast>
			{/if}
			<slot><!-- optionaasdl fallback --></slot>
		</div>
	</div>
</div>
