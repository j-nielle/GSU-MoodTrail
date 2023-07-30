<script>
	import { Alert } from 'flowbite-svelte'
	import Register from '$lib/components/forms/Register.svelte'
	export let form;
</script>

<svelte:head>
	<title>Create an account</title>
</svelte:head>

{#if form?.success === true}
	<Alert color="green">Registration has been successful! Please check your inbox.</Alert>
{:else if form?.success === false}
	<Alert color="red">Oops! Something went wrong. Please try again later.</Alert>
{/if}

<div class="flex justify-center">
	<Register />
</div>
