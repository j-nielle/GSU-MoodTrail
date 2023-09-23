<script>
	import { enhance } from '$app/forms';
	import { Card, Button, Label, Input, Checkbox } from 'flowbite-svelte';
	import { EnvelopeSolid, ShieldSolid } from 'flowbite-svelte-icons';
</script>

<Card
	class="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md flex max-w-2xl flex-col p-4 sm:p-12"
	size="lg"
	padding="xl"
>
	<form class="flex flex-col space-y-6" action="?/login" method="POST" use:enhance>
		<h3 class="text-xl text-center font-bold text-gray-900 dark:text-white">Welcome back!</h3>
		<Label class="space-y-2">
			<span>Email</span>
			<Input
				type="email"
				id="email"
				name="email"
				class="font-normal"
				placeholder="name@company.com"
				required
			>
				<svelte:fragment slot="left">
					<EnvelopeSolid tabindex="-1" size="xs" class="ml-1" />
				</svelte:fragment>
			</Input>
		</Label>
		<Label class="space-y-2">
			<span>Password</span>
			<Input
				type="password"
				id="password"
				name="password"
				class="font-normal"
				placeholder="•••••••"
				required
				autocomplete
			>
				<svelte:fragment slot="left">
					<ShieldSolid tabindex="-1" size="xs" class="ml-1" />
				</svelte:fragment>
			</Input>
		</Label>
		<Button type="submit" color="blue" class="w-full font-bold leading-relaxed">LOGIN</Button>
		<div class="flex justify-between font-medium">
			<!-- <Checkbox on:click={handleRememberMe}>Remember me</Checkbox> -->
			<a href="/reset-password" class="ml-auto text-sm text-red-500 hover:underline dark:text-slate-100">
				Forgot password
			</a>
		</div>
	</form>
</Card>
