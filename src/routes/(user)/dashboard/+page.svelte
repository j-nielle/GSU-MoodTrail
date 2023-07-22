<script>
	import { Skeleton } from 'flowbite-svelte';
	import { onMount, onDestroy } from 'svelte';

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
