<script>
	import { Alert } from 'flowbite-svelte';
	import Login from '$lib/components/forms/Login.svelte';

	export let form;
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

{#if form?.error}
	<Alert color="red">Oops! {form?.error}</Alert>
{/if}

<div class="flex justify-center mt-5">
	<Login />
</div>
