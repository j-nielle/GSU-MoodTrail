<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import {
		Pagination,
		PaginationItem,
		Checkbox,
		Input,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		TableSearch
	} from 'flowbite-svelte';

	export let data;

	let requestsData = [];

	$: ({ supabase } = data);
	$: requestsData = data.requests;
	$: page = data.page;
	$: limit = data.limit;

	let searchTerm = '';
	let dateFilter = '';
	let filteredItems;

	onMount(() => {
		const requestsChannel = supabase.channel('schema-db-changes').on('postgres_changes',{
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				},(payload) => {
					requestsData = [payload.new, ...requestsData];
				}
			).subscribe((status) => console.log('inside /requests/+page.svelte:', status));

		return () => {
			requestsChannel.unsubscribe();
		};
	});

	const toggleRequestStatus = async (req) => {
		let isCompleted = req.iscompleted;

		try {
			const { data, error } = await supabase
				.from('RequestEntries')
				.update({ iscompleted: isCompleted })
				.eq('id', req.id)
				.select()
				.single();
		} catch (error) {
			console.log(error);
		}
	}

	$: {
		filteredItems = requestsData.filter((req) => {
			const phoneMatch = req.contact_num.includes(searchTerm);
			const reqMatch = req.request_type.toLowerCase().includes(searchTerm.toLowerCase());
			const statusMatch = req.iscompleted.toString().toLowerCase().includes(searchTerm.toLowerCase());
			// this statement checks if the date filter is not empty, if it is not empty, it will format the date to YYYY-MM-DD
			// if dateFilter is empty then it will return true which means it will not filter the data
			const dateMatch = dateFilter !== '' ? dayjs(req.created_at).format('YYYY-MM-DD') === dayjs(dateFilter).format('YYYY-MM-DD') : true;

			return (searchTerm !== '' && dateFilter !== '') // if both search term and date filter are not empty
				? (phoneMatch || reqMatch || statusMatch) && dateMatch // then it will filter the data according to the search term and date filter
				: searchTerm !== '' // else if search term is not empty
					? phoneMatch || reqMatch || statusMatch // then it will filter the data according to the search term
					: dateFilter !== '' // else if date filter is not empty
						? dateMatch // then it will filter the data according to the date filter
						: true; // else it will return true which means it will not filter the data
		});
	}
</script>

<svelte:head>
	<title>Requests</title>
</svelte:head>

<div class="flex justify-between">
	<div class="flex items-center">
		<TableSearch divClass="relative overflow-x-auto ml-4 mt-3" class="p-0"
			placeholder="Search by request, phone, or status*" hoverable={true} bind:inputValue={searchTerm}/>
		<button class="text-slate-700 mt-3" class:hidden={!searchTerm != ''} on:click={() => { searchTerm = ''; }}>
			<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-backspace-fill" viewBox="0 0 16 16">
				<path d="M15.683 3a2 2 0 0 0-2-2h-7.08a2 2 0 0 0-1.519.698L.241 7.35a1 1 0 0 0 0 1.302l4.843 5.65A2 2 0 0 0 6.603 15h7.08a2 2 0 0 0 2-2V3zM5.829 5.854a.5.5 0 1 1 .707-.708l2.147 2.147 2.146-2.147a.5.5 0 1 1 .707.708L9.39 8l2.146 2.146a.5.5 0 0 1-.707.708L8.683 8.707l-2.147 2.147a.5.5 0 0 1-.707-.708L7.976 8 5.829 5.854z" />
			</svg>
		</button>
	</div>
	<div class="mt-1">
		<Input type="date" class="w-auto h-auto m-4 mr-8 mt-8" bind:value={dateFilter} />
	</div>
</div>
<div class="ml-4-6 ml-4 mb-7 mr-11">
	<Table divClass="w-full text-left text-sm text-gray-500 dark:text-gray-400 ml-4">
		<caption class="text-lg font-bold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800 mb-6">
			Help Requests from the Kiosk
			<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
				By default, it shows requests for the current date and is sorted according to the latest
				request.
			</p>
			<p class="mt-1 text-xs font-light text-gray-500 dark:text-gray-400">
				(*status: false/true, pertains to the completion of the request)
			</p>
		</caption>
		<TableHead class="border border-zinc-300 text-center">
			<TableHeadCell>Phone Number</TableHeadCell>
			<TableHeadCell>Request Type</TableHeadCell>
			<TableHeadCell>Timestamp</TableHeadCell>
			<TableHeadCell>Status</TableHeadCell>
		</TableHead>
		<TableBody tableBodyClass="divide-y border border-zinc-300 max-h-40 overflow-y-auto">
			{#if filteredItems === undefined || filteredItems.length === 0}
				<TableBodyRow>
					<TableBodyCell>No data</TableBodyCell>
					<TableBodyCell>No data</TableBodyCell>
					<TableBodyCell>No data</TableBodyCell>
					<TableBodyCell>No data</TableBodyCell>
				</TableBodyRow>
			{:else}
				{#each filteredItems as req}
					<TableBodyRow>
						<TableBodyCell>{req.contact_num}</TableBodyCell>
						<TableBodyCell>{req.request_type}</TableBodyCell>
						<TableBodyCell>{new Date(req.created_at).toLocaleString()}</TableBodyCell>
						<TableBodyCell class="flex justify-center">
							<Checkbox
								class="cursor-pointer mr-0"
								bind:checked={req.iscompleted}
								on:change={() => toggleRequestStatus(req)}
							/>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
	<div class="flex flex-col items-center justify-center gap-2 mt-3">
		<div class="text-sm text-gray-700 dark:text-gray-400">
			Page <span class="font-semibold text-gray-900 dark:text-white">{page}</span>
		</div>
	
		<Pagination table>
			<span class="text-white" slot="prev"><a href="?page={page - 1}&limit={limit}">Prev</a></span>
			<span class="text-white" slot="next"><a href="?page={page + 1}&limit={limit}">Next</a></span>
		</Pagination>
	</div>
</div>
