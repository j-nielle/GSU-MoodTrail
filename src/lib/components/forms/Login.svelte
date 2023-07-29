<script>
  import { enhance } from '$app/forms';
	import { Card, Button, Label, Input, Checkbox } from 'flowbite-svelte';
  import { EnvelopeSolid, ShieldSolid } from 'flowbite-svelte-icons';
</script>

<Card>
  <form class="flex flex-col space-y-6" action="?/login" method="POST" use:enhance>
    <h3 class="text-xl text-center font-medium text-gray-900 dark:text-white">Welcome back!</h3>
    <Label class="space-y-2">
      <span>Email</span>
      <Input type="email" id="email" name="email" placeholder="name@company.com" required>
        <svelte:fragment slot="left">
          <EnvelopeSolid size="xs" class="ml-1" />
        </svelte:fragment>
      </Input>
    </Label>
    <Label class="space-y-2">
      <span>Password</span>
      <Input type="password" id="password" name="password" placeholder="•••••••" required autocomplete>
        <svelte:fragment slot="left">
          <ShieldSolid size="xs" class="ml-1" />
        </svelte:fragment>
      </Input>
    </Label>
    <div class="flex justify-between">
      <!-- <Checkbox on:click={handleRememberMe}>Remember me</Checkbox> -->
      <a href="/register" class="text-sm hover:font-semibold text-primary-700 hover:underline dark:text-primary-500">Not registered?</a>
      <a href="/reset-password" class="ml-auto hover:font-semibold text-sm text-primary-700 hover:underline dark:text-primary-500">Forgot password?</a>
    </div>
    <Button type="submit" class="w-full">LOGIN</Button>
  </form>
</Card>