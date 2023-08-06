<script>
	import { onMount } from 'svelte';
	import { newRequest } from '$lib/newRequest';
	import { Alert } from 'flowbite-svelte';
	import { BellRingSolid, CloseSolid } from 'flowbite-svelte-icons';
	
	export let data
	$: ({ supabase } = data);

	onMount(() => {
		const toastChannel = supabase
			.channel('toast-requests')
			.on('postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				},(payload) => {
					if (payload.new) {
						newRequest.set(true);
						setTimeout(() => {
							newRequest.set(false);
						}, 5000);
					}
				}
			).subscribe((status) => console.log("inside /dashboard/+layout.svelte:",status));
	
		return () => {
			toastChannel.unsubscribe();
		}
	});
</script>

<div class="items-center">
	{#if $newRequest}
    <Alert color="blue" class="flex m-5 justify-between">
      <BellRingSolid class="text-blue-700" />
      <div>
        <span class="font-bold text-blue-700">(NEW)</span> Help request received!
      </div>
      <CloseSolid class="cursor-pointer" on:click={() => newRequest.set(false)} />
    </Alert>
	{/if}
	<slot />
</div>
