<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Toast, Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	import { newRequest } from '$lib/stores/index.js';
	import { BellRingSolid, UserCircleOutline, UserEditOutline, UserSettingsOutline } from 'flowbite-svelte-icons';

	export let data

	$: ({ supabase } = data);

	onMount(() => {
		const toastChannelTwo = supabase
			.channel('toast-requests-2')
			.on( 'postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				}, (payload) => {
					if (payload.new) {
						newRequest.update(() => true)
						setTimeout(() => {
							newRequest.set(false);
						}, 8000);
					}
				}
			).subscribe((status) => console.log("inside /dashboard/settings/+layout.svelte:",status));
	
		return () => {
			toastChannelTwo.unsubscribe();
		}
	});

	let spanClass =
		'flex items-center p-2 text-base text-white bg-blue-600 rounded-lg hover:bg-blue-700';

	$: activeUrl = $page.url.pathname;
</script>

{#if $newRequest}
	<Toast position="top-right" simple contentClass="flex space-x-4 divide-x divide-gray-200 dark:divide-gray-700 items-center">
		<span tabindex="-1"><BellRingSolid /></span>
		<div class="pl-4">
			<span class="font-bold text-blue-700">(NEW)</span> Help request received!
		</div>
	</Toast>
{/if}
<div class="p-4 bg-zinc-50 flex space-x-3">
	<Sidebar class="w-fit">
    <SidebarWrapper class="bg-white drop-shadow-lg ring-1 h-fit w-36 flex p-4 justify-center">
      <SidebarGroup>
        <SidebarItem label="Profile" href="/dashboard/settings/profile" activeClass={spanClass}
          active={activeUrl === '/dashboard/settings/profile'}>
          <svelte:fragment slot="icon">
            <UserCircleOutline />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Account" href="/dashboard/settings/account" activeClass={spanClass}
          active={activeUrl === '/dashboard/settings/account'}>
          <svelte:fragment slot="icon">
            <UserEditOutline />
          </svelte:fragment>
        </SidebarItem>
        <SidebarItem label="Security" href="/dashboard/settings/security" activeClass={spanClass}
          active={activeUrl === '/dashboard/settings/security'}>
          <svelte:fragment slot="icon">
            <UserSettingsOutline />
          </svelte:fragment>
        </SidebarItem>
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
  <slot />
</div>