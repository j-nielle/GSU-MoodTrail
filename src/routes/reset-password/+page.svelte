<script>
	import { Alert } from 'flowbite-svelte';
	import ResetPass from '$lib/components/forms/ResetPass.svelte';

	export let form;
</script>

<svelte:head>
	<title>Password Reset Request</title>
</svelte:head>

{#if form?.success}
	<div class="p-8">
		<Alert color="green">
			<span class="font-medium">Request sent succesfully! Please check your inbox.</span>
		</Alert>
	</div>
{:else if form?.error}
	<div class="p-8">
		<Alert color="red">
			<span class="font-medium">Oops! Something went wrong...</span> Please try again later.
		</Alert>
	</div>
{/if}

<div class="flex justify-center">
	<ResetPass />
</div>
