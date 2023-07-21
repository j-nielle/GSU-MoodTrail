<script lang="ts">
  export let data

  let { user, tableData } = data
  $: ({ user, tableData } = data)

	console.log(data)
</script>

<svelte:head>
	<title>Profile Settings</title>
</svelte:head>

<!-- <div>Protected content for {user.email}</div>
<pre>{JSON.stringify(tableData, null, 2)}</pre>
<pre>{JSON.stringify(user, null, 2)}</pre> -->