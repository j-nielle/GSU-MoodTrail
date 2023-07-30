<script>
  import { Card, Button, Label, Input } from 'flowbite-svelte';
  import { EnvelopeSolid, ShieldSolid } from 'flowbite-svelte-icons';
  import { enhance } from '$app/forms';
</script>

<Card class="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md flex max-w-2xl flex-col p-4 sm:p-12" size="lg" padding='xl'>
  <form class="justify-center items-center space-y-6" action="?/register" method="POST" use:enhance>
    <h3 class="text-xl text-center mb-6 font-bold text-gray-900 dark:text-white">
      Create an account
    </h3>
    <Label class="space-y-2">
      <span>Email</span>
      <Input type="email" id="email" name="email" class="font-normal" placeholder="name@company.com" required>
        <svelte:fragment slot="left">
          <EnvelopeSolid size="xs" class="ml-1" />
        </svelte:fragment>
      </Input>
    </Label>
    <Label class="space-y-2">
      <span>Password</span>
      <Input type="password" id="password" name="password" class="font-normal" placeholder="•••••••" required autocomplete>
        <svelte:fragment slot="left">
          <ShieldSolid size="xs" class="ml-1" />
        </svelte:fragment>
      </Input>
    </Label>
    <Label class="space-y-2">
      <span>Confirm Password</span>
      <Input type="password" name="passwordConfirm" class="font-normal" placeholder="•••••••" required autocomplete>
        <svelte:fragment slot="left">
        <ShieldSolid size="xs" class="ml-1" />
        </svelte:fragment>
      </Input>
    </Label>
    <Button type="submit" class="w-full font-bold leading-relaxed" color="dark">REGISTER</Button>
    <div class="text-sm text-center font-medium text-gray-500 dark:text-gray-300">
      <span class="cursor-auto">Already have an account? </span>
      <a href="/login" class="text-blue-700 hover:font-bold dark:text-slate-100 cursor-pointer">Sign In</a>
    </div>
  </form>
</Card>