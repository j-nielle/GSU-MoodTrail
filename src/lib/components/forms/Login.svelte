<script>
	import { enhance } from '$app/forms';
	import { Card, Button, Label, Input, Checkbox } from 'flowbite-svelte';
	import { EnvelopeSolid, ShieldSolid } from 'flowbite-svelte-icons';

	const cardClass="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md flex max-w-2xl flex-col p-4 sm:p-12"
	const inputFont="font-normal"
	const loginBtnClass = "w-full font-bold leading-relaxed"
	const labelSpace = "space-y-2"
</script>

<Card class={cardClass}>
	<form class="flex flex-col space-y-4" action="?/login" method="POST" use:enhance>
		<h3 class="text-xl text-center font-bold text-gray-900 dark:text-white">Welcome back!</h3>
		<Label class={labelSpace}>
			<span>Email</span>
			<Input type="email" id="email" name="email" class={inputFont} placeholder="name@company.com" required>
				<svelte:fragment slot="left">
					<EnvelopeSolid tabindex="-1" size="xs" class="ml-1" />
				</svelte:fragment>
			</Input>
		</Label>
		<Label class={labelSpace}>
			<span>Password</span>
			<Input type="password" id="password" name="password" class={inputFont} placeholder="•••••••"
				required autocomplete>
				<svelte:fragment slot="left">
					<ShieldSolid tabindex="-1" size="xs" class="ml-1" />
				</svelte:fragment>
			</Input>
		</Label>
		<Button type="submit" color="blue" class={loginBtnClass}>LOGIN</Button>
		<div class="self-center font-medium">
			<a href="/reset-password" class="ml-auto text-sm text-red-700 hover:underline dark:text-slate-100">
				Forgot password?
			</a>
		</div>
	</form>
</Card>
