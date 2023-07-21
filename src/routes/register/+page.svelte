<script>
	import { Alert, Card, Button, Label, Input } from 'flowbite-svelte';
	import { enhance } from '$app/forms';
	export let form;
</script>

{#if form?.success === true}
	<Alert color="green">Registration has been successful! Please check your inbox.</Alert>
{:else if form?.success === false}
	<Alert color="red">Oops! Something went wrong. Please try again later.</Alert>
{/if}

<div class="grid md:grid-cols-2">
	<Card>
		<form class="flex flex-col space-y-6" action="?/register" method="POST" use:enhance>
			<h3 class="text-xl text-center font-medium text-gray-900 dark:text-white">
				Create an account
			</h3>
			<Label class="space-y-2">
				<span>Name</span>
				<Input type="text" id="name" name="name" placeholder="Jose P. Rizal" required>
					<svg
						slot="left"
						aria-hidden="true"
						class="w-5 h-5 text-gray-500 dark:text-gray-400"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
					</svg>
				</Input>
			</Label>
			<Label class="space-y-2">
				<span>Username</span>
				<Input type="text" id="username" name="username" placeholder="JP_Rizal" required>
					<svg
						slot="left"
						aria-hidden="true"
						class="w-5 h-5 text-gray-500 dark:text-gray-400"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
					</svg>
				</Input>
			</Label>
			<Label class="space-y-2">
				<span>Email</span>
				<Input
					type="email"
					id="email"
					name="email"
					placeholder="name@company.com"
					value={form?.email ?? ''}
					required
				>
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
			<Label class="space-y-2">
				<span>Your password</span>
				<Input
					type="password"
					id="password"
					name="password"
					placeholder="•••••"
					required
					autocomplete=""
				>
					<svg
						slot="left"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						class="w-5 h-5 text-gray-500 dark:text-gray-400"
						viewBox="0 0 20 20"
					>
						<path
							fill-rule="evenodd"
							d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99A1.5 1.5 0 0 1 8 5z"
						/>
					</svg>
				</Input>
			</Label>
			<Label class="space-y-2">
				<span>Re-type Password</span>
				<Input type="password" name="passwordConfirm" placeholder="•••••" required autocomplete="">
					<svg
						slot="left"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						fill="currentColor"
						class="w-5 h-5 text-gray-500 dark:text-gray-400"
						viewBox="0 0 20 20"
					>
						<path
							fill-rule="evenodd"
							d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99A1.5 1.5 0 0 1 8 5z"
						/>
					</svg>
				</Input>
			</Label>
			<Button type="submit" class="w-full">REGISTER</Button>
			<div class="text-sm text-center font-medium text-gray-500 dark:text-gray-300">
				Already have an account? <a
					href="/login"
					class="text-primary-700 hover:underline dark:text-primary-500">Sign In</a
				>
			</div>
		</form>
	</Card>
</div>
