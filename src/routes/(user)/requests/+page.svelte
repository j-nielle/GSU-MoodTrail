<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import {
		Button,
		Checkbox,
		Input,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Search,
		P
	} from 'flowbite-svelte';
	import { ChevronLeftSolid, ChevronRightSolid } from 'flowbite-svelte-icons';
	import { requestTypes } from '$lib/constants/index.js';

	export let data;

	let searchTerm = '';
	let dateFilter = '';
	let filteredItems = {};

	let page = 1;
	let limit = 5;
	let maxPage, startIndex, endIndex, paginatedItems = {};

	let pendingRequestsOnly = true;

	let requestsData = data.requests;

	$: ({ supabase } = data);

	onMount(() => {
		const requestsChannel = supabase.channel('requestsChannel')
			.on('postgres_changes',{
					event: '*',
					schema: 'public',
					table: 'Request'
				},(payload) => {
					if (payload.eventType === 'INSERT') {
						requestsData = _.cloneDeep([payload.new, ...requestsData]);
					} else if (payload.eventType === 'UPDATE') {
						const updatedIndex = requestsData.findIndex((req) => req.id === payload.old.id);

						if (updatedIndex !== -1) {
							requestsData[updatedIndex] = payload.new;
						}

						requestsData = _.cloneDeep(requestsData);
					}
				}
			).subscribe()

		return () => {
			requestsChannel.unsubscribe();
		};
	});

	$: {
		filteredItems = requestsData?.filter((req) => {
			const phoneMatch = req.contact_num.includes(searchTerm);
			const emailMatch = req?.email_address?.toLowerCase().includes(searchTerm.toLowerCase());
			const reqMatch = requestTypes[req.request_type].toLowerCase().includes(searchTerm.toLowerCase());

			// if date filter is not empty, it will format the date of the results to YYYY-MM-DD
			// else it will return true which means it will not filter the data
			const dateMatch = dateFilter !== '' ? dayjs(req.created_at).format('YYYY-MM-DD') === dayjs(dateFilter).format('YYYY-MM-DD') : true;

			// if both search term and date filter are not empty
			return searchTerm !== '' && dateFilter !== '' 
				// then it will filter the data according to the search term and date filter
				? (phoneMatch || reqMatch || emailMatch) && dateMatch 
				: searchTerm !== '' // else if search term is not empty
				? phoneMatch || reqMatch || emailMatch // then it will filter the data according to the search term
				: dateFilter !== '' // else if date filter is not empty
				? dateMatch // then it will filter the data according to the date filter
				: true; // else it will return true which means it will not filter the data
		});

		startIndex = (page - 1) * limit; // get the starting index for the current page
		endIndex = startIndex + limit; // get the ending index for the current page
		
		if (page > maxPage) { // if current page number exceeds the max number of pages
			page = 1; // set the current page to be the last page

			// recalculate the starting and ending indices for the last page
			startIndex = (page - 1) * limit;
			endIndex = startIndex + limit;
		}

		if(pendingRequestsOnly){
			// paginatedItems will only show the pending requests
      paginatedItems = filteredItems?.filter(req => !req.iscompleted).slice(startIndex, endIndex);
			const remainingItems = filteredItems?.filter(req => !req.iscompleted);
			maxPage = Math.ceil(remainingItems?.length / limit)
    } else {
      paginatedItems = filteredItems?.slice(startIndex, endIndex);
			maxPage = Math.ceil(filteredItems?.length / limit)
    }
	}

	const toggleRequestStatus = async (req) => {
		let isCompleted = req.iscompleted;
		console.log(isCompleted)
		try {
			const { data,error: updateError } = await supabase
				.from('Request')
				.update({ iscompleted: isCompleted })
				.eq('id', req.id)
				.select()
			console.log(data,updateError)
			if(updateError) throw updateError;
		} catch (error) {
			console.error(error);
		}
	};

	/**
	 * Changes the current page to 'newPage' if it's within a valid range.
	 *
	 * @param {number} newPage - The page number to navigate to.
	 */
	function changePage(newPage) {
		// if 'newPage' is within valid range (i.e., between 1 and 'maxPage'), then update 'page'
		if (newPage >= 1 && newPage <= maxPage) {
			page = newPage;
		}
	}
</script>

<svelte:head>
	<title>Requests</title>
</svelte:head>

<div class="bg-white">
	<div class="flex justify-between">
		<div class="flex items-center ml-8">
			<Search size="md" class="w-96 mr-3 h-11" placeholder="Search by phone number or request type" bind:value={searchTerm} />
			<div class="flex flex-row justify-start w-full space-x-2">
				<Checkbox class="cursor-pointer mr-0" bind:value={pendingRequestsOnly} bind:checked={pendingRequestsOnly} on:click={() => pendingRequestsOnly = !pendingRequestsOnly} />
				<P class="text-sm font-normal text-gray-500 dark:text-gray-400">Show pending requests only</P>
			</div>
		</div>
		<div class="flex items-center mr-8"> 
			<Input type="date" class="w-auto h-11 m-4 mt-5" bind:value={dateFilter} />
			<Button class="h-11 mt-1 p-4 w-fit focus:ring-0" color="red" on:click={() => { searchTerm = ''; dateFilter = ''; }}>
				Reset
			</Button>
		</div>
	</div>

	<div class="ml-4 mb-7 mr-11">
		<div class="flex justify-between ml-4">
			<P class="text-lg mt-3 font-bold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800 mb-6">
				Help Requests from the Kiosk
				<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
					By default, it shows pending requests only. You can change this by unchecking the checkbox above.
				</p>
			</P>
			{#if maxPage > 1}
				<div class="flex flex-row items-center justify-center space-x-2">
					<div class="flex text-sm text-center text-gray-700 dark:text-gray-400">
						<span class="font-semibold text-gray-900 dark:text-white">{page} <span class="font-normal">of</span> {maxPage}</span>
					</div>
					<div class="flex space-x-2">
						<ChevronLeftSolid class="cursor-pointer focus:outline-0" on:click={() => changePage(page - 1)} />
						<ChevronRightSolid class="cursor-pointer focus:outline-0" on:click={() => changePage(page + 1)} />
					</div>
				</div>
			{/if}
		</div>
		<Table divClass="w-full text-left text-sm text-gray-500 dark:text-gray-400 ml-4">
			<TableHead class="border border-zinc-300">
				<TableHeadCell>Phone Number</TableHeadCell>
				<TableHeadCell>Email Address</TableHeadCell>
				<TableHeadCell>Request Type</TableHeadCell>
				<TableHeadCell>Timestamp</TableHeadCell>
				<TableHeadCell class="text-center">Status</TableHeadCell>
			</TableHead>
			<TableBody tableBodyClass="divide-y border border-zinc-300 max-h-40 overflow-y-auto">
				{#if paginatedItems === undefined || paginatedItems.length === 0}
					<TableBodyRow>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
					</TableBodyRow>
				{:else}
					{#each paginatedItems as req}
						<TableBodyRow>
							<TableBodyCell>{req.contact_num}</TableBodyCell>
							<TableBodyCell>{req.email_address || 'Unavailable'}</TableBodyCell>
							<TableBodyCell>{requestTypes[req.request_type]}</TableBodyCell>
							<TableBodyCell>{new Date(req.created_at).toLocaleString()}</TableBodyCell>
							<TableBodyCell class="flex justify-center">
								<Checkbox class="cursor-pointer mr-0" bind:checked={req.iscompleted} on:change={() => toggleRequestStatus(req)} />
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
	</div>
</div>