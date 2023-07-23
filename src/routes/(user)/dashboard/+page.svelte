<script>
	import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
	import { createClient } from '@supabase/supabase-js';
	import { onMount, onDestroy } from 'svelte';

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: {
			persistSession: false
		}
	});

	export let data;
	let requestsData = [];

	$: requestsData = data.requests;

	onMount(() => {
		const channel = supabase.channel('schema-db-changes')
			.on('postgres_changes',{
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				},
				(payload) => {
					console.log('new request added');
					requestsData = [payload.new,...requestsData];
				}
			)
			.subscribe((status) => console.log(status));

			return () => {
				channel.unsubscribe();
			};
	});

	$: console.log(requestsData)
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="p-10">
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
			{#each requestsData as req}
				<tr>
					<td>{req.contact_num}</td>
					<td>{req.request_type}</td>
					<td>{new Date(req.created_at).toLocaleString()}</td>
					<td>{req.iscompleted}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
