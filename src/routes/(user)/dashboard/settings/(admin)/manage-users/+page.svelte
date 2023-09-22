<script>
  // @ts-nocheck
  import _ from 'lodash';  
  import { onMount } from 'svelte';
	import {
    // PaginationItem,
    Badge, 
    // Input,
    // Card, 
    // Button, 
    // ButtonGroup, 
    // Label,
    // Select,
    Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Search, 
    // FloatingLabelInput, 
    // Helper
  } from 'flowbite-svelte';
  import { roleColor } from '$lib/constants/index.js';
  // import { roleColor, roles, buttonState } from '$lib/constants/index.js';
  // import { addNewUser, editUser } from '$lib/stores/index.js';
  // import { AddUser, EditUser } from '$lib/components/forms/index.js';

	export let data;

  let searchTerm = '';
  let filteredItems;

  $: ({ supabase } = data);

  let usersData = data.users;
  
	$: filteredItems = usersData.filter((req) => {
    const nameMatch = req?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = req?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatch = req?.role?.toLowerCase().includes(searchTerm.toLowerCase());
      
		return (searchTerm !== '') // if
		  ? (nameMatch || emailMatch || roleMatch) : true; // else 
	});
  
  onMount(() => {
		const usersChannel = supabase.channel('schema-db-changes')
        .on('postgres_changes',{
					event: '*',
					schema: 'public',
					table: 'Users'
				},(payload) => {
					usersData = _.cloneDeep([payload.new,...usersData]);
				}
			).subscribe((status) => console.log('inside /manage-users/+page.svelte:', status));

		return () => {
			usersChannel.unsubscribe();
		};
	});

  // function handleAddUser(){
  //   editUser.update(() => false);
  //   addNewUser.update(value  => !value);
  // }

  // function handleEditUser(){
  //   addNewUser.update(() => false);
  //   editUser.update(value  => !value);
  // }
</script>

<svelte:head>
	<title>Manage Users</title>
</svelte:head>

<div class="p-10 ring-1 bg-white w-fit shadow-md drop-shadow-md rounded z-10">
  <div class="relative w-full flex items-center space-x-8">
    <caption class="text-xl my-3 font-bold text-left w-max text-gray-900 dark:text-white dark:bg-gray-800">
      List of Users
    </caption>
    <div>
      <Search size="md" class="w-72" placeholder="Search by name, email, or role" bind:value={searchTerm} />
      <!-- {#if !$addNewUser}
        <Button size="sm" shadow color="purple" pill on:click={handleAddUser}>Add New User</Button>
      {:else}
        <Button size="sm" shadow color="red" pill on:click={handleAddUser}>Hide Form</Button>
      {/if} -->
    </div>
  </div>
  <div class='w-full mt-4'>
    <Table divClass="text-left text-sm w-full text-gray-500 border border-zinc-300 dark:text-gray-400 max-h-72 overflow-y-auto">
      <TableHead class="bg-zinc-100 border border-t border-zinc-300 top-0 sticky">
        <TableHeadCell>Name</TableHeadCell>
        <TableHeadCell>Email Address</TableHeadCell>
        <TableHeadCell>User Role</TableHeadCell>
        <!-- <TableHeadCell></TableHeadCell>
        <TableHeadCell></TableHeadCell> -->
      </TableHead>
      <TableBody tableBodyClass="divide-y bg-white">
        {#if filteredItems === undefined || filteredItems.length === 0}
          <TableBodyRow class="border border-zinc-300 z-10">
            <TableBodyCell>No data</TableBodyCell>
            <TableBodyCell>No data</TableBodyCell>
            <TableBodyCell>No data</TableBodyCell>
            <!-- <TableBodyCell></TableBodyCell>
            <TableBodyCell></TableBodyCell> -->
          </TableBodyRow>
        {:else}
        {#each filteredItems as user}
          <TableBodyRow class="z-10">
            <TableBodyCell> {user.name ?? 'N/A'} </TableBodyCell>
            <TableBodyCell> {user.email} </TableBodyCell>
            <TableBodyCell>  
              <Badge border rounded color={roleColor[user.role]}>{user.role}</Badge> 
            </TableBodyCell>
            <!-- <TableBodyCell class="cursor-pointer text-center hover:underline text-blue-700">
              <button on:click={handleEditUser} class="hover:underline">Edit User</button>
            </TableBodyCell>
            <TableBodyCell class="flex justify-center cursor-pointer ">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="red" class="bi bi-trash-fill" viewBox="0 0 16 16"> <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/> </svg>
            </TableBodyCell> -->
          </TableBodyRow>
        {/each}
        {/if}
      </TableBody>
    </Table>
  </div>
</div>
<!-- {#if $addNewUser}
  <AddUser />
{/if} -->