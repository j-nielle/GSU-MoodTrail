<script>
	import { enhance } from '$app/forms';
	import { Alert, Card, Button, Label, Input, Checkbox } from 'flowbite-svelte';
	import Login from '$lib/components/forms/Login.svelte';

	export let form;
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

{#if form?.error === 'Email not confirmed'}
	<Alert color="red">Oops! You entered unverified email. Please try again later.</Alert>
{:else if form?.error === 'Invalid credentials.'}
	<Alert color="red">Oops! You entered invalid credentials. Please try again later.</Alert>
{/if}

<div class="flex justify-center mt-5">
	<Login />
</div>
