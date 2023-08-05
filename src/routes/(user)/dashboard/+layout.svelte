<script>
	import { onMount, onDestroy } from 'svelte';
	import { newRequest } from '$lib/newRequest';
	import { Toast } from 'flowbite-svelte';
	import { BellRingSolid } from 'flowbite-svelte-icons';
	
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
		<Toast position="top-right" simple contentClass="flex space-x-4 divide-x divide-gray-200 dark:divide-gray-700 items-center">
			<BellRingSolid class="text-blue-700" />
			<div class="pl-4">
				<span class="font-bold text-blue-700">(NEW)</span> Help request received!
			</div>
		</Toast>
	{/if}
	<slot />
</div>
