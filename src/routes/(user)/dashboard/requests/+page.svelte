<script>
	import { onMount, onDestroy } from 'svelte';
	import { BellRingSolid } from 'flowbite-svelte-icons';
	import {
		Checkbox,
		Toast,
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
	let requestsData = [];
	let newRequest = false;

	$: ({ supabase } = data);
	$: requestsData = data.requests;
	
	$: filteredItems = searchTerm === '' ? requestsData
  	: requestsData.filter((req) => {
      const typeMatch = req.request_type.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
      const statusMatch = req.iscompleted.toString().toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1;
      return typeMatch || statusMatch;
  });

	onMount(() => {
		const channelA = supabase
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
						newRequest = true;
						setTimeout(() => {
							newRequest = false;
						}, 8000);
					}
					console.log(payload.new);
					requestsData = [payload.new, ...requestsData];
				}
			)
			.subscribe((status) => console.log(status));

		return () => {
			channelA.unsubscribe();
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
			console.log('data:', data);
			if (error) {
				console.log(error);
			}
			//isCompleted = data?.iscompleted;
		} catch (error) {
			console.log(error);
		}
	};

	$: console.log(requestsData);
</script>

<svelte:head>
	<title>Requests</title>
</svelte:head>

<div class="p-10">
	{#if newRequest}
		<Toast
			position="top-right"
			simple
			contentClass="flex space-x-4 divide-x divide-gray-200 dark:divide-gray-700 items-center"
		>
			<BellRingSolid class="text-blue-700" />
			<div class="pl-4">
				<span class="font-bold text-blue-700">(NEW)</span> Help request received!
			</div>
		</Toast>
	{/if}
	
	<!-- placeholder date filter component -->
	<input type="date" id="notifs-datepicker" class="mb-3">
	
	<TableSearch
		divClass="relative overflow-x-auto"
		placeholder="Search by request or status (true/false)"
		hoverable={true}
		bind:inputValue={searchTerm}>
		<Table divClass="relative overflow-x-hidden shadow-xl sm:rounded-lg h-3/5">
			<TableHead class="sticky top-0">
				<TableHeadCell>#</TableHeadCell>
				<TableHeadCell>Phone</TableHeadCell>
				<TableHeadCell>Request Type</TableHeadCell>
				<TableHeadCell>Timestamp</TableHeadCell>
				<TableHeadCell>Status</TableHeadCell>
			</TableHead>
			<TableBody tableBodyClass="divide-y">
				{#each filteredItems as req}
					<TableBodyRow>
						<TableBodyCell>{req.id}</TableBodyCell>
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
			</TableBody>
		</Table>
	</TableSearch>
</div>
