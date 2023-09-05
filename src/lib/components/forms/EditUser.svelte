<script>
  import { blur  } from 'svelte/transition';
  import { enhance } from '$app/forms';
	import { Card, Button, Badge, FloatingLabelInput, Helper } from 'flowbite-svelte';
  import { roles, buttonState } from '$lib/constants/index.js';

  let editName = '';
  let editEmail = '';
  let editPassword = '';
  let editRole = '';
  let message = '';
</script>

<div transition:blur={{ amount: 5, duration: 200 }}>
  <Card class="p-4 h-max space-y-5 rounded bg-white dark:bg-gray-800 self-start" size="lg" padding='xl'>
    {#if message}
      <p>{message}</p>
    {/if}
    <h3 class="font-bold text-slate-950 text-center text-xl">Edit User</h3>
    <form class="space-y-5" action="/?editUser" method="POST" use:enhance>
      <FloatingLabelInput size="small" style="outlined" id="editName" name="editName" type="text" label="Name" />
      <FloatingLabelInput size="small" style="outlined" id="editEmail" name="editEmail" type="text" label="Email Address" required />
      <FloatingLabelInput size="small" style="outlined" id="editPassword" name="editPassword" type="password" label="Password" autocomplete required />
      <input type="hidden" id="editRole" name="editRole" bind:value={editRole} />
    
      <div class="space-y-3">
        <p class="text-sm">Choose their role:</p>
        <div class="flex flex-row space-x-2">
          {#each roles as role}
            <button on:click={() => editRole = role.label}>
              <Badge class={editRole === role.label ? buttonState.active : buttonState.inactive} border rounded color={role.color}>{role.label}</Badge>
            </button>
          {/each}
        </div>
      </div>
      <Button pill shadow type="submit" color="purple" class="w-full font-bold leading-relaxed">SAVE</Button>
    </form>
  </Card>
</div>