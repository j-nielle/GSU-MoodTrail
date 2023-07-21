<script>
  import { page } from '$app/stores';
  import { Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
  let spanClass = 'flex items-center p-2 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700';
  $: activeUrl = $page.url.pathname
</script>


<div class="p-10 mt-3 bg-slate-200/20">
  <div class="flex items-stretch space-x-3">
    <Sidebar>
      <SidebarWrapper class="bg-white drop-shadow-lg ring-1 h-screen">
        <SidebarGroup>
          <SidebarItem label="Profile Settings" href='/dashboard/settings/profile' activeClass={spanClass} active={activeUrl === '/dashboard/settings/profile'} />
          <SidebarItem label="Account Settings" href='/dashboard/settings/account' activeClass={spanClass} active={activeUrl === '/dashboard/settings/account'} />
          <SidebarItem label="Security" href='/dashboard/settings/security' activeClass={spanClass} active={activeUrl === '/dashboard/settings/security'} />
        </SidebarGroup>
      </SidebarWrapper>
    </Sidebar>
    <div class="flex flex-1 font-sans rounded-md border-2 border-slate-500/10 shadow-lg shadow-slate-400 ring-1 bg-white">
      <slot><!-- optional fallback --></slot>
    </div>
  </div>
</div>