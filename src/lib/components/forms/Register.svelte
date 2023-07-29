<script>
  import { Card, Button, Label, Input } from 'flowbite-svelte';
  import { UserSolid, EnvelopeSolid, ShieldSolid } from 'flowbite-svelte-icons';
  import { enhance } from '$app/forms';
</script>

<Card>
  <form class="flex flex-col space-y-6" action="?/register" method="POST" use:enhance>
    <h3 class="text-xl text-center font-medium text-gray-900 dark:text-white">
      Create an account
    </h3>
    <Label class="space-y-2">
      <span>Full Name</span>
      <Input type="text" id="name" name="name" required>
        <svelte:fragment slot="left">
					<UserSolid size="xs" class="ml-1" />
				</svelte:fragment>
      </Input>
    </Label>
    <Label class="space-y-2">
      <span>Username</span>
      <Input type="text" id="username" name="username" required>
        <svelte:fragment slot="left">
					<UserSolid size="xs" class="ml-1" />
				</svelte:fragment>
      </Input>
    </Label>
    <Label class="space-y-2">
      <span>Email</span>
      <Input type="email" id="email" name="email" required>
        <svelte:fragment slot="left">
          <EnvelopeSolid size="xs" class="ml-1" />
        </svelte:fragment>
      </Input>
    </Label>
    <Label class="space-y-2">
      <span>Password</span>
      <Input type="password" id="password" name="password" placeholder="•••••••" required autocomplete="">
      <svelte:fragment slot="left">
        <ShieldSolid size="xs" class="ml-1" />
      </svelte:fragment>
      </Input>
    </Label>
    <Label class="space-y-2">
      <span>Confirm Password</span>
      <Input type="password" name="passwordConfirm" placeholder="•••••" required autocomplete="">
        <svelte:fragment slot="left">
        <ShieldSolid size="xs" class="ml-1" />
      </svelte:fragment>
      </Input>
    </Label>
    <Button type="submit" class="w-full">REGISTER</Button>
    <div class="text-sm text-center font-medium text-gray-500 dark:text-gray-300">
      Already have an account? 
      <a href="/login" class="text-primary-700 hover:underline dark:text-primary-500">Sign In</a>
    </div>
  </form>
</Card>