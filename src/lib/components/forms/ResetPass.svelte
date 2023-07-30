<script>
	import { enhance } from '$app/forms';
	import { Card, Button, Label, Input} from 'flowbite-svelte';
  import { EnvelopeSolid } from 'flowbite-svelte-icons';
</script>

<Card class="bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md flex max-w-2xl flex-col p-4 sm:p-12" size="lg" padding='lg'>
  <form class="flex flex-col space-y-3" action="?/requestPassReset" method="POST" use:enhance>
    <h3 class="text-xl text-center font-bold text-gray-900 dark:text-white mb-3">
      Forgot Password?
    </h3>
    <Label class="space-y-2 font-normal">
      <span>Enter the email associated with your account</span>
      <Input type="email" name="email" class="font-normal" placeholder="name@company.com" required>
        <svelte:fragment slot="left">
          <EnvelopeSolid size="xs" class="ml-1" />
        </svelte:fragment>
      </Input>
    </Label>
    <Button type="submit" class="w-full font-bold leading-relaxed">SEND REQUEST</Button>
  </form>
</Card>