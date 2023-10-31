<script>
	import { enhance } from '$app/forms';
	import { Card, Button, Label, Input } from 'flowbite-svelte';
	import { EnvelopeSolid } from 'flowbite-svelte-icons';
</script>

<Card size="lg" padding="lg">
	<form class="flex flex-col space-y-4 w-fit" action="?/requestPassReset" method="POST" use:enhance>
		<Label class="space-y-2 font-normal">
			<span>Enter email associated with your account</span>
			<Input type="email" name="email" class="font-normal" placeholder="name@gmail.com" required>
				<svelte:fragment slot="left">
					<EnvelopeSolid tabindex="-1" size="xs" class="ml-1" />
				</svelte:fragment>
			</Input>
		</Label>
		<Button type="submit" class="w-full font-bold leading-relaxed">SEND REQUEST</Button>
	</form>
</Card>
