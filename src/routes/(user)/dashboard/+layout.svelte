<script>
	import { page } from '$app/stores';
	import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	import { ChartMixedSolid, PhoneSolid } from 'flowbite-svelte-icons';
	
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
			<slot><!-- optional fallback --></slot>
		</div>
	</div>
</div>
