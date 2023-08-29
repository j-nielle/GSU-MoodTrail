<script>
	export let data;

	let usersData = data.users;

	$: ({ supabase } = data);
</script>

<svelte:head>
	<title>Manage Users</title>
</svelte:head>

{#each usersData as user}
	<p>{user.email}</p>
	<p>{user.name}</p>
	<p>{user.user_role}</p>
{/each}
