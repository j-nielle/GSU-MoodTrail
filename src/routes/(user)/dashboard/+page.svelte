<script>
	import { Alert } from 'flowbite-svelte';
	import { onMount, onDestroy } from 'svelte';
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import { createClient } from '@supabase/supabase-js';

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: { persistSession: false }
	});

	//const channel = supabase.channel('schema-db-changes');

	export let data;

	console.log(data.newData);
	// let requestsData;

	// $: requestsData = Array.from(data.requests.values());

	// channel
	// 	.on(
	// 		'postgres_changes',
	// 		{
	// 			event: 'INSERT',
	// 			schema: 'public',
	// 			table: 'RequestEntries'
	// 		},
	// 		(payload) => {
	// 			console.log('new request detected');
	// 			requestsData = [...payload.new, ...requestsData];
	// 		}
	// 	)
	// 	.subscribe((status) => console.log(status));

	// onDestroy(() => {
	// 	channel.unsubscribe();
	// });
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="p-10">
	{#if data.newData}
		<Alert color="green" dismissable>
			<p>New request received!</p>
		</Alert>
	{/if}
	<h1>Dashboard</h1>
	<table>
		<thead>
			<tr>
				<th>Phone</th>
				<th>Request Type</th>
				<th>Timestamp</th>
				<th>Status</th>
			</tr>
		</thead>
		<tbody>
			<!-- {#if !requestsData.length}
				<tr>
					<td>No requests found</td>
					<td>No requests found</td>
					<td>No requests found</td>
					<td>No requests found</td>
				</tr>
			{/if}
			{#each requestsData as req}
				<tr>
					<td>{req.contact_num}</td>
					<td>{req.request_type}</td>
					<td>{req.created_at}</td>
					<td>{req.iscompleted}</td>
				</tr>
			{/each} -->
		</tbody>
	</table>
</div>
