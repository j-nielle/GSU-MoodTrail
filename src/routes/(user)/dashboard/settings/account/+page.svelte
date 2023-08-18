<script>
	import { Alert, Card, Button, Label, Input, Checkbox } from 'flowbite-svelte';
  import { ShieldSolid } from 'flowbite-svelte-icons';
	import { enhance } from '$app/forms';

	export let form;
</script>

<svelte:head>
	<title>Account Settings</title>
</svelte:head>

<div class="flex ring-1">
  {#if form?.success}
    <div class="p-8">
      <Alert color="green">
        <span class="font-medium">Password changed succesfully!</span>
      </Alert>
    </div>
  {:else if form?.error}
    <div class="p-8">
      <Alert color="red">
        <span class="font-medium">Oops! Something went wrong...</span> Please try again later.
      </Alert>
    </div>
  {/if}
	<Card>
		<form class="flex flex-col space-y-6" action="?/resetPassword" method="POST" use:enhance>
			<Label class="space-y-2 font-semibold">
				<span>New Password</span>
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
