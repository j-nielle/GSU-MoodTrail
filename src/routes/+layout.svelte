<script>
	import '../app.postcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;

	$: ({ supabase, session } = data);

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				/**
				 * The usage of invalidate tells sveltekit that the root `+layout.ts load` function
				 * should be executed whenever the session updates to keep the page store in sync.
				 */
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<nav>
	<div>
		{#if session}
			<h1>Welcome, {session.user.email}!</h1>
			<form method="POST" action="/logout">
				<button type="submit" class="bg-red-500 p-3">Logout</button>
			</form>
		{:else}
			<button class="bg-purple-500 p-3"><a href="/register">Create an account</a></button>
			<button class="bg-blue-500 p-3"><a href="/login">Login</a></button>
		{/if}
	</div>
</nav>

<slot />
