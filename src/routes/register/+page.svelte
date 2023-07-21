<script>
	import { enhance } from '$app/forms';
	export let form;
</script>

{#if form?.success === true}
    <p>Please check your inbox.</p>
{:else if form?.success === false}
	<p>Oops! Something went wrong...</p>
{/if}
<form action="?/register" method="post" use:enhance>
    <label for="email">Enter Email Address</label>
	<input type="email" name="email" value={form?.email ?? ''} />
    <label for="password">Enter Password</label>
	<input id="email" type="password" name="password" />
	<button>Register Account</button>
</form>
