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
	import { AddUser, EditUser, RemoveUser } from '$lib/components/forms/index.js';
	import { ChevronLeftSolid, ChevronRightSolid, TrashBinSolid, EditOutline } from 'flowbite-svelte-icons';

	export let data;
	export let form;

	$: ({ supabase } = data);

	let usersData = data.users;

	let searchTerm = '';
	let filteredItems = [];
	let currentPage = 1;
	let limit = 5;
	let maxPage, startIndex, endIndex, paginatedItems;

	let divClass = "text-left text-sm w-full text-gray-500 border border-zinc-300 dark:text-gray-400";

	let userToUpdate;
	let userToDelete;
	let removeUserModal = false;
	addNewUser.set(false);
	editUser.set(false);

	onMount(() => {
		const usersChannel = supabase.channel('usersChannel')
			.on('postgres_changes', {
					event: '*',
					schema: 'public',
					table: 'Users'
				}, (payload) => {
					console.log(payload.eventType)
					if (payload.eventType === 'INSERT') {
						usersData = _.cloneDeep([payload.new, ...usersData]).sort((a, b) => a.username.localeCompare(b.username));
						console.log(usersData)
					}else if (payload.eventType === 'UPDATE') {
						// updateAlert = true;

						// setTimeout(() => {
						// 	updateAlert = false;
						// }, 2000);

						// payload.new returns updated row, payload.old returns property "id" of updated row
						const updatedIndex = usersData.findIndex((user) => user.id === payload.old.id);

						if (updatedIndex !== -1) {
							usersData[updatedIndex] = payload.new;
						}

						usersData = _.cloneDeep(usersData).sort((a, b) => a.username.localeCompare(b.username));
					} else if (payload.eventType === 'DELETE') {
						// deleteAlert = true;

						// setTimeout(() => {
						// 	deleteAlert = false;
						// }, 2000);

						// payload.old returns property "id" of deleted row
						const updatedUsersData = usersData.filter(
							(user) => user.id !== payload.old.id
						);
						usersData = updatedUsersData;
					}
				}
			).subscribe((status) => console.log('/settings/manage-users', status));

		return () => {
			usersChannel.unsubscribe();
		};
	});

	$: if(usersData){
		filteredItems = usersData.filter((req) => {
			const usernameMatch = req?.username?.toLowerCase().includes(searchTerm.toLowerCase());
			const emailMatch = req?.email?.toLowerCase().includes(searchTerm.toLowerCase());
			const roleMatch = req?.role?.toLowerCase().includes(searchTerm.toLowerCase());

			return searchTerm !== '' // if
				? usernameMatch || emailMatch || roleMatch
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

	$: if(form?.removalSuccess){
		removeUserModal = false;
	}

	function handleAddUser(){
	  editUser.update(() => false);
	  addNewUser.update(()  => true);
	}

	function handleEditUser(email){
		userToUpdate = usersData.filter((user) => user.email == email);

	  addNewUser.update(() => false);
	  editUser.update(()  => true);
	}

	async function handleRemoveUser(userID) {
		userToDelete = usersData.filter((user) => user.id == userID);
		removeUserModal = true;
	}

	function changePage(newPage) {
		if (newPage >= 1 && newPage <= maxPage) {
			currentPage = newPage;
		}
	}
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
				<TableHeadCell>Username</TableHeadCell>
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
							<TableBodyCell>{user.username}</TableBodyCell>
							<TableBodyCell>{user.email}</TableBodyCell>
							<TableBodyCell>
								<Badge border rounded color={roleColor[user.role]}>{user.role}</Badge>
							</TableBodyCell>
							<TableBodyCell class="cursor-pointer text-center hover:underline text-blue-700">
								<div class="flex justify-center cursor-pointer">
									<EditOutline
										class="text-purple-600 focus:outline-none hover:text-green-700"
										on:click={handleEditUser(user.email)}
									/>
								</div>
            </TableBodyCell>
            <TableBodyCell class="flex justify-center cursor-pointer ">
							<div class="flex justify-center cursor-pointer">
								<TrashBinSolid
									class="text-red-600 focus:outline-none hover:text-red-700"
									on:click={handleRemoveUser(user.id)}
								/>
							</div>
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
{:else if $editUser}
	<EditUser user={userToUpdate} />
{/if}


<RemoveUser bind:open={removeUserModal} bind:handler={form} bind:userToDelete={userToDelete} />