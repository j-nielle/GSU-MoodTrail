<script>
	import { enhance } from '$app/forms';
	export let form;
</script>

<form action="?/login" method="post" use:enhance>
    <label for="email">Email Address</label>
	<input id="email" type="email" name="email" value={form?.email ?? ''} />
	<label for="password">Password</label>
    <input id="password" type="password" name="password" />
	<button>Login</button>
</form>
