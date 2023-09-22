<script>
	import { Alert, Card, Button, Label, Input } from 'flowbite-svelte';
  import { ShieldSolid } from 'flowbite-svelte-icons';
	import { enhance } from '$app/forms';

  export let data;
	export let form;

  let user = data.user;

  let changePass = false;
</script>

<svelte:head>
	<title>Account Settings</title>
</svelte:head>

<div class="flex">
	<Card class="sm:p-8  ring-1 rounded">
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
    <p class="text-xl font-bold text-slate-900">Account Settings</p>
    <div class="my-4 space-y-1 text-slate-900">
      <p class=""><span class="font-semibold">Name:</span> {user?.name || 'User'}</p>
      <p class=""><span class="font-semibold">Email Address:</span> {user?.email}</p>
      <p class=""><span class="font-semibold">User Role:</span> {user?.role}</p>
    </div>
    
		{#if changePass}
      <Button class="mb-4 w-fit" on:click={() => changePass = false}>Hide</Button>
      <Card class="w-fit">
        <form class="flex flex-col space-y-6" action="?/resetPassword" method="POST" use:enhance>
          <Label class="space-y-2 font-semibold">
            <span>Reset Password</span>
            <Input type="password" id="password" name="password" placeholder="••••••••" required autocomplete>
              <svelte:fragment slot="left">
                <ShieldSolid tabindex="-1" size="xs" class="ml-1" />
              </svelte:fragment>
            </Input>
          </Label>
          <Button color="green" type="submit" class="w-full">SUBMIT</Button>
        </form>
      </Card>
    {:else}
      <Button class="w-fit" color="red" on:click={() => changePass = true}>Change Password</Button>
    {/if}
	</Card>
</div>
