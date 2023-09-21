<script>
	import { Alert, Card, Button, Label, Input } from 'flowbite-svelte';
  import { ShieldSolid } from 'flowbite-svelte-icons';
	import { enhance } from '$app/forms';

  export let data;
	export let form;

  let user = data.user;

  console.log(user)
</script>

<svelte:head>
	<title>Account Settings</title>
</svelte:head>

<div class="flex ring-1">
  

	<Card>
    {#if form?.success}
      <div>
        <Alert color="green">
          <span class="font-medium">Password changed succesfully!</span>
        </Alert>
      </div>
    {:else if form?.error}
      <div>
        <Alert color="red">
          <span class="font-medium">{form?.error}</span> Please try again later.
        </Alert>
      </div>
    {/if}
    <p class="my-4 font-bold">Email: {user[0]?.email}</p>

		<form class="flex flex-col space-y-6" action="?/resetPassword" method="POST" use:enhance>
			<Label class="space-y-2 font-semibold">
				<span>Change Password?</span>
				<Input type="password" id="password" name="password" placeholder="••••••••" required autocomplete>
					<svelte:fragment slot="left">
            <ShieldSolid tabindex="-1" size="xs" class="ml-1" />
          </svelte:fragment>
				</Input>
			</Label>
			<Button type="submit" class="w-full">SUBMIT NEW PASSWORD</Button>
		</form>
	</Card>
</div>
