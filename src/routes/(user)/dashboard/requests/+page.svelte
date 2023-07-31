<script>
	// @ts-nocheck
	import _ from 'lodash';
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
		TableSearch
	} from 'flowbite-svelte';

	export let data;

	let searchTerm = '';
	let typing = false;
	let dateFilter = '';
	let filteredItems;
	let requestsData = [];

	$: ({ supabase } = data);
	$: requestsData = data.requests;

	$: {
		if(searchTerm != ''){
			typing = true
			dateFilter = '';
			
			filteredItems = requestsData.filter((req) => {
				const phoneMatch = req.contact_num.includes(searchTerm);
				const typeMatch = req.request_type.toLowerCase().includes(searchTerm.toLowerCase());
				const statusMatch = req.iscompleted.toString().toLowerCase().includes(searchTerm.toLowerCase());
				return typeMatch || statusMatch || phoneMatch;
			});
		}else filteredItems = requestsData;
	}

	const handleDateFilter = (e) => {
		searchTerm = '';
		
		dateFilter = e.target.value;
		filteredItems = requestsData.filter((req) => {
			const dateMatch = new Date(req.created_at).toLocaleDateString() === new Date(dateFilter).toLocaleDateString();
			return dateMatch;
		});
	};

	onMount(() => {
		const requestsChannel = supabase
			.channel('schema-db-changes')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				},
				(payload) => {
					if (payload.new) {
						requestsData = [payload.new, ...requestsData];
					}
				}
			)
			.subscribe((status) => console.log('inside /requests/+page.svelte:', status));

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
	};

	$: console.log(requestsData);
</script>

<svelte:head>
	<title>Requests</title>
</svelte:head>

<div class="p-4">
	<div class="flex justify-between outline outline-1">
		<div class="flex items-center">
			<TableSearch divClass="relative overflow-x-auto" placeholder="Search by request, phone, or status*" hoverable={true} bind:inputValue={searchTerm} />
			<button class="text-slate-700" class:hidden={!typing} on:click={() => { searchTerm = ''; typing=false; }}>
				<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-backspace-fill" viewBox="0 0 16 16"> <path d="M15.683 3a2 2 0 0 0-2-2h-7.08a2 2 0 0 0-1.519.698L.241 7.35a1 1 0 0 0 0 1.302l4.843 5.65A2 2 0 0 0 6.603 15h7.08a2 2 0 0 0 2-2V3zM5.829 5.854a.5.5 0 1 1 .707-.708l2.147 2.147 2.146-2.147a.5.5 0 1 1 .707.708L9.39 8l2.146 2.146a.5.5 0 0 1-.707.708L8.683 8.707l-2.147 2.147a.5.5 0 0 1-.707-.708L7.976 8 5.829 5.854z"/> </svg>
			</button>
		</div>
		<div class="mt-1">
			<Input type="date" class="w-auto h-auto m-4" bind:value={dateFilter} on:input={handleDateFilter} />
		</div>
	</div>
	<Table divClass="relative overflow-x-hidden outline outline-red-500 outline-1 h-3/5">
		<caption class="p-5 text-lg font-bold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800">
			Help Requests from the Kiosk
			<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">By default, it shows requests for the current date and is sorted according to the latest request.</p>
			<p class="mt-1 text-xs font-light text-gray-500 dark:text-gray-400">(*status: false/true, pertains to the completion of the request)</p>
	</caption>
		<TableHead class="sticky top-0">
			<TableHeadCell>Phone Number</TableHeadCell>
			<TableHeadCell>Request Type</TableHeadCell>
			<TableHeadCell>Timestamp</TableHeadCell>
			<TableHeadCell>Status</TableHeadCell>
		</TableHead>
		<TableBody tableBodyClass="divide-y">
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
						<TableBodyCell>
							<Checkbox
								class="cursor-pointer"
								bind:checked={req.iscompleted}
								on:change={() => toggleRequestStatus(req)}
							/>
						</TableBodyCell>
					</TableBodyRow>
				{/each}
			{/if}
		</TableBody>
	</Table>
</div>
