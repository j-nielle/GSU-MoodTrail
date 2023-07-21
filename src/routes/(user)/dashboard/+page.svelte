<script>
	export let data

    // commented out client side data fetching w/ RLS
	// $: ({ supabase, session } = data);

	// let loadedData = [];
	// async function loadData() {
	// 	const { data } = await supabase.from('test').select('*').limit(20);
	// 	loadedData = data;
	// }

	// $: if (session) {
	// 	loadData();
	// }

    // $: ({ user, tableData } = data);
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div>
	<h1>Dashboard</h1>
</div>

<!-- {#if session}
<p>client-side data fetching with RLS</p>
<pre>{JSON.stringify(loadedData, null, 2)}</pre>
{/if} -->

<!-- <div>Protected content for {user.email}</div>
<pre>{JSON.stringify(tableData, null, 2)}</pre>
<pre>{JSON.stringify(user, null, 2)}</pre> -->
