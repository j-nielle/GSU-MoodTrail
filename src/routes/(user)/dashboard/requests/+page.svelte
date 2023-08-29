<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
	import {
		PaginationItem,
    Button,
		Checkbox,
		Input,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Search
	} from 'flowbite-svelte';

	export let data;

  let searchTerm = '';
	let dateFilter = '';
	let filteredItems;

	$: requestsData = data.requests;

	$: ({ supabase, maxPage, page, limit, count} = data);

	onMount(() => {
		const requestsChannel = supabase.channel('schema-db-changes')
        .on('postgres_changes',{
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				},(payload) => {
					requestsData = _.cloneDeep([payload.new,...requestsData]);
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

  $: {
    if ((searchTerm !== '' || dateFilter !== '') && page !== 1) {
      page = 1;
      goto(`?page=${page}&limit=${limit}`);
    }

    if (searchTerm !== '' || dateFilter !== '') {
      maxPage = Math.ceil(filteredItems.length / limit);
    } else {
      maxPage = Math.ceil(count / limit);
    }
  }

</script>

<svelte:head>
	<title>Requests</title>
</svelte:head>

<div class="bg-white">
	<div class="flex justify-between">
		<div class="flex items-center ml-8">
			<Search size="md" class="w-80 mr-3" placeholder="Search by request, phone, or status*" bind:value={searchTerm} />
      <Button class="h-10 p-4 w-fit focus:ring-0" color="red" on:click={()=> { searchTerm = ''; dateFilter = ''; }}>Reset</Button>
		</div>
		<div>
			<Input type="date" class="w-auto h-auto m-4 mr-8 mt-5" bind:value={dateFilter} />
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
				<p class="mt-1 text-xs font-light text-gray-500 dark:text-gray-400">(*status: false/true, pertains to the completion of the request)</p>
			</caption>
			<TableHead class="border border-zinc-300">
				<TableHeadCell>Phone Number</TableHeadCell>
				<TableHeadCell>Request Type</TableHeadCell>
				<TableHeadCell>Timestamp</TableHeadCell>
				<TableHeadCell class="text-center">Status</TableHeadCell>
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
								<Checkbox class="cursor-pointer mr-0" bind:checked={req.iscompleted}
									on:change={() => toggleRequestStatus(req)}
								/>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
		<div class="flex flex-col items-center justify-center gap-2 mt-3">
      {#if maxPage > 1}
			<div class="text-sm text-center text-gray-700 dark:text-gray-400">
				Page <span class="font-semibold text-gray-900 dark:text-white">{page} <span class="font-normal">of</span> {maxPage}</span>
			</div>
			<div class="flex justify-between space-x-2">
        <!-- ensures that the page number is never less than 1 -->
        <PaginationItem class="bg-slate-900 text-white hover:bg-slate-950 hover:text-white" href="?page={Math.max(1, page - 1)}&limit={limit}">Prev</PaginationItem>
        <!-- ensures that the page number does not exceed the maximum page number -->
        <PaginationItem class="bg-slate-900 text-white hover:bg-slate-950 hover:text-white" href="?page={Math.min(maxPage, page + 1)}&limit={limit}">Next</PaginationItem>
		  </div>
      {/if}
		</div>
	</div>
</div>
