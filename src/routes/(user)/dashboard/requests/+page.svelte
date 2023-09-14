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

  let page = 1;
  let limit = 5;
  let maxPage,startIndex, endIndex, paginatedItems;

	let requestsData = data.requests;

  $: ({ supabase } = data);

	onMount(() => {
		const requestsChannel = supabase.channel('schema-db-changes')
        .on('postgres_changes',{
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				},(payload) => {
					requestsData = _.cloneDeep([payload.new,...requestsData]);
				}
			).subscribe((status) => console.log(status));

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
    startIndex = (page - 1) * limit;
    endIndex = startIndex + limit;
    maxPage = Math.ceil(requestsData.length / limit);
    paginatedItems = filteredItems.slice(startIndex, endIndex);
  }

  function changePage(newPage) {
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
			<Search size="md" class="w-80 mr-3" placeholder="Search by request, phone, or status*" bind:value={searchTerm} />
      <Button class="h-10 p-4 w-fit focus:ring-0" color="red" on:click={()=> { searchTerm = ''; dateFilter = ''; }}>Reset</Button>
		</div>
		<div>
			<Input type="date" class="w-auto h-auto m-4 mr-8 mt-5" bind:value={dateFilter} />
		</div>
	</div>
	<div class="ml-4-6 ml-4 mb-7 mr-11">
		<Table divClass="w-full text-left text-sm text-gray-500 dark:text-gray-400 ml-4">
			<caption class="text-lg font-bold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800 mb-4">
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
				{#if paginatedItems === undefined || paginatedItems.length === 0}
					<TableBodyRow>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
					</TableBodyRow>
				{:else}
					{#each paginatedItems as req}
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
		<div class="flex flex-col items-center justify-center space-y-2 mt-2">
      {#if maxPage > 1}
        <div class="flex text-sm text-center text-gray-700 dark:text-gray-400">
          <span class="font-semibold text-gray-900 dark:text-white">{page} <span class="font-normal">of</span> {maxPage}</span>
        </div>
        <div class="flex space-x-1.5">
          <PaginationItem class="bg-slate-900 text-white hover:bg-slate-950 hover:text-white" on:click={() => changePage(page - 1)}>Prev</PaginationItem>
          <PaginationItem class="bg-slate-900 text-white hover:bg-slate-950 hover:text-white" on:click={() => changePage(page + 1)}>Next</PaginationItem>
        </div>
      {/if}
		</div>
	</div>
</div>
