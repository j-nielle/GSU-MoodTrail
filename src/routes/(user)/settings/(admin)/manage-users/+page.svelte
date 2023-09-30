<script>
	// @ts-nocheck
	import _ from 'lodash';
	import { onMount } from 'svelte';
	import {
		// PaginationItem,
		Badge,
		// Input,
		// Card,
		Button,
		// ButtonGroup,
		// Label,
		// Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Search
		// FloatingLabelInput,
		// Helper
	} from 'flowbite-svelte';
	import { roleColor } from '$lib/constants/index.js';
	import { addNewUser, editUser } from '$lib/stores/index.js';
	import { AddUser, EditUser } from '$lib/components/forms/index.js';
	import { ChevronLeftSolid, ChevronRightSolid } from 'flowbite-svelte-icons';

	export let data;

	$: ({ supabase } = data);

	let usersData = data.users;

	let searchTerm = '';
	let filteredItems = [];
	let currentPage = 1;
	let limit = 5;
	let maxPage, startIndex, endIndex, paginatedItems;

	let divClass = "text-left text-sm w-full text-gray-500 border border-zinc-300 dark:text-gray-400"

	onMount(() => {
		const usersChannel = supabase.channel('usersChannel')
			.on('postgres_changes', {
					event: '*',
					schema: 'auth',
					table: 'users'
				}, (payload) => {
					console.log(payload.eventType)
					if (payload.eventType == 'INSERT') {
						usersData = _.cloneDeep([payload.new, ...usersData])//.sort((a, b) => a.name.localeCompare(b.name));
						console.log("new data",usersData)
					}
				}
			).subscribe((status) => console.log('/settings/manage-users', status));

		return () => {
			usersChannel.unsubscribe();
		};
	});

	$: if(usersData){
		filteredItems = usersData.filter((req) => {
			const nameMatch = req?.user_metadata.name?.toLowerCase().includes(searchTerm.toLowerCase());
			const emailMatch = req?.email?.toLowerCase().includes(searchTerm.toLowerCase());
			const roleMatch = req?.role?.toLowerCase().includes(searchTerm.toLowerCase());

			return searchTerm !== '' // if
				? nameMatch || emailMatch || roleMatch
				: true; // else
		});

		startIndex = (currentPage - 1) * limit; // Calculate the starting index for the current page.
		endIndex = startIndex + limit; // Calculate the ending index for the current page.
		maxPage = Math.ceil(filteredItems?.length / limit); // Calculate the maximum number of pages.
		
		// If the current page number exceeds the maximum number of pages
		if (currentPage > maxPage) {
			currentPage = 1; // set the current page to be the last page.

			// recalculate the starting and ending indices for the last page
			startIndex = (currentPage - 1) * limit;
			endIndex = startIndex + limit;
		}

		// Get only those items from 'filteredItems' that belong to the current page.
		paginatedItems = filteredItems?.slice(startIndex, endIndex);
	}

	function handleAddUser(){
	  editUser.update(() => false);
	  addNewUser.update(value  => !value);
	}

	function handleEditUser(){
	  addNewUser.update(() => false);
	  editUser.update(value  => !value);
	}

	function changePage(newPage) {
		if (newPage >= 1 && newPage <= maxPage) {
			currentPage = newPage;
		}
	}

	$: console.log("current data:",usersData)
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
			<Search size="md" class="w-72" placeholder="Search by name, email, or role"
				bind:value={searchTerm}
			/>
		</div>
		<div class="ml-4">
			{#if !$addNewUser}
			<Button size="sm" shadow color="purple" pill on:click={handleAddUser}>Add New User</Button>
			{:else}
				<Button size="sm" shadow color="red" pill on:click={handleAddUser}>Hide Form</Button>
			{/if}
		</div>
	</div>

	<div class="w-full mt-6">
		<Table {divClass} >
			<TableHead class="bg-zinc-100 border border-t border-zinc-300 top-0 sticky">
				<TableHeadCell>Name</TableHeadCell>
				<TableHeadCell>Email Address</TableHeadCell>
				<TableHeadCell>User Role</TableHeadCell>
				<TableHeadCell></TableHeadCell>
        <TableHeadCell></TableHeadCell>
			</TableHead>
			<TableBody tableBodyClass="divide-y bg-white">
				{#if paginatedItems === undefined || paginatedItems?.length === 0}
					<TableBodyRow class="border border-zinc-300 z-10">
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell></TableBodyCell>
            <TableBodyCell></TableBodyCell>
					</TableBodyRow>
				{:else}
					{#each paginatedItems as user}
						<TableBodyRow class="z-10">
							<TableBodyCell>{user.user_metadata.name ?? 'N/A'}</TableBodyCell>
							<TableBodyCell>{user.email}</TableBodyCell>
							<TableBodyCell>
								<Badge border rounded color={roleColor[user.role]}>{user.role}</Badge>
							</TableBodyCell>
							<TableBodyCell class="cursor-pointer text-center hover:underline text-blue-700">
              <button on:click={handleEditUser} class="hover:underline">Edit User</button>
            </TableBodyCell>
            <TableBodyCell class="flex justify-center cursor-pointer ">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="red" class="bi bi-trash-fill" viewBox="0 0 16 16"> <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/> </svg>
            </TableBodyCell>
						</TableBodyRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
		{#if maxPage > 1}
		<div class="flex flex-row items-center justify-start space-x-2 mt-4">
			<div class="flex text-sm text-center text-gray-700 dark:text-gray-400">
				<span class="font-semibold text-gray-900 dark:text-white"
					>{currentPage} <span class="font-normal">of</span> {maxPage}</span
				>
			</div>
			<div class="flex space-x-2">
				<ChevronLeftSolid class="cursor-pointer focus:outline-0" on:click={() => changePage(currentPage - 1)} />
				<ChevronRightSolid class="cursor-pointer focus:outline-0" on:click={() => changePage(currentPage + 1)} />
			</div>
		</div>
	{/if}
	</div>
</div>
{#if $addNewUser}
  <AddUser />
{/if}
