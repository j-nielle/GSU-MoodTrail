<script>
	// @ts-nocheck
	import { enhance } from '$app/forms';
	import { Button, Modal} from 'flowbite-svelte';
	export let userToDelete;
  export let open;

  let userID;

  $: if(userToDelete){
    userID = userToDelete[0]?.id;
  }
</script>

<Modal title="Delete User?" bind:open size="xs" class="max-w-xl">
	<form class="flex flex-col" method="POST" action="?/removeUser" use:enhance>

    <input type="hidden" id="userID" name="userID" bind:value={userID} />

		<Button type="submit" color="red" class="w-full mt-3">CONFIRM DELETE</Button>
	</form>
</Modal>
