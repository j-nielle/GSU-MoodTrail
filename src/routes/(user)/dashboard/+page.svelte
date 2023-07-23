<script>
	import { onMount, onDestroy } from 'svelte';
	import { PUBLIC_SUPABASE_URL } from '$env/static/public';
	import { PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

	import { createClient } from '@supabase/supabase-js';

	const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

	const channel = supabase
		.channel('schema-db-changes')
		.on(
			'postgres_changes',
			{
				event: 'INSERT',
				schema: 'public',
				table: 'RequestEntries'
			},
			(payload) => console.log(payload)
		)
		.subscribe((status) => console.log(status));
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
			</tr>
		</thead>
		<tbody>
			<!-- {#each loadedData?? as row}
        <tr>
          <td>{row.phone}</td>
          <td>{row.requesttype}</td>
          <td>{row.timestamp}</td>
        </tr>
      {/each} -->
		</tbody>
	</table>
</div>

<!-- {#if session}
<p>client-side data fetching with RLS</p>
<pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if} -->

<!-- <div>Protected content for {user.email}</div>
<pre>{JSON.stringify(tableData, null, 2)}</pre>
<pre>{JSON.stringify(user, null, 2)}</pre> -->
