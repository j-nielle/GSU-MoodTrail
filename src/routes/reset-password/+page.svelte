<script>
	import { enhance } from '$app/forms';
	import { Alert, Card, Button, Label, Input, Checkbox } from 'flowbite-svelte';
	export let form;
</script>

<svelte:head>
    <title>Password Reset Request</title>
</svelte:head>

<!-- {#if form?.error}
	<div class="p-8">
		<Alert color="red">
			<span class="font-medium">Oops! Something went wrong...</span> Please try again later.
		</Alert>
	</div>
{:else if form?.success}
	<div class="p-8">
		<Alert color="green">
			<span class="font-medium">Request sent succesfully!</span> Please check your inbox.
		</Alert>
	</div>
{/if} -->

<div class="grid md:grid-cols-2">
	<Card>
		<form class="flex flex-col space-y-6" action="?/requestPassReset" method="POST" use:enhance>
			<h3 class="text-xl text-center font-medium text-gray-900 dark:text-white">
				Forgot Password?
			</h3>
			<Label class="space-y-2">
				<span>Enter the email associated with your account</span>
				<Input type="email" name="email" placeholder="name@company.com" required>
					<svg
						slot="left"
						aria-hidden="true"
						class="w-5 h-5 text-gray-500 dark:text-gray-400"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path
							d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"
						/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg
					>
				</Input>
			</Label>
			<Button type="submit" class="w-full">SEND REQUEST</Button>
		</form>
	</Card>
</div>
