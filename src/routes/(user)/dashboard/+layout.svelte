<script>
	import { page } from '$app/stores';
	import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	let spanClass =
		'flex items-center p-2 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700';
	$: activeUrl = $page.url.pathname;
</script>

<div class="p-10 mt-3 bg-slate-200/20">
	<div class="flex items-stretch space-x-3">
		<Sidebar class="w-fit">
			<SidebarWrapper class="bg-white drop-shadow-lg">
				<SidebarGroup>
					<SidebarItem label="Dashboard" href="/dashboard">
						<svelte:fragment slot="icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bar-chart-fill" viewBox="0 0 16 16"> <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z"/> </svg>
						</svelte:fragment>
					</SidebarItem>
					<SidebarItem label="Requests" href="/dashboard/requests">
						<svelte:fragment slot="icon">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-telephone-fill" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/> </svg>
						</svelte:fragment>
					</SidebarItem>
				</SidebarGroup>
			</SidebarWrapper>
		</Sidebar>
		<div
			class="flex flex-1 font-sans rounded-md border-2 border-slate-500/10 shadow-lg shadow-slate-400 bg-white"
		>
			<slot><!-- optional fallback --></slot>
		</div>
	</div>
</div>

