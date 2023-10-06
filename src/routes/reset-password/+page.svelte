<script>
	import { Alert } from 'flowbite-svelte';
	import ResetPass from '$lib/components/forms/ResetPass.svelte';

	export let form;
</script>

<svelte:head>
	<title>Password Reset Request</title>
</svelte:head>

{#if form?.success}
	<Alert color="green" class="text-center">
		<span class="font-medium">Request sent succesfully! Please check your inbox.</span>
	</Alert>
{:else if form?.error}
	<Alert color="red" class="text-center">
		<span class="font-medium">{form?.error}</span> Please try again later.
	</Alert>
{/if}

<div class="flex justify-center mt-5">
	<ResetPass />
</div>
