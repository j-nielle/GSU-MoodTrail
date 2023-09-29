<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Alert } from 'flowbite-svelte';
	import { BellRingSolid, CloseSolid } from 'flowbite-svelte-icons';
	import { consistentLowMoods, focusTable, newRequest } from '$lib/stores/index.js';

	export let data;

	let newLowMoodData = false;
	let consistentStreaksInfo = new Map();
	const students = [];

	$: ({ supabase } = data);

	onMount(() => {
		const toastChannel = supabase.channel('toast-requests')
			.on('postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				}, (payload) => {
					newRequest.update(() => true);
					setTimeout(() => {
						newRequest.update(() => false);
					}, 5000);
				}
			).subscribe((status) => console.log('/dashboard layout', status));

		const unsubscribe = consistentLowMoods.subscribe((updatedMoods) => {
			updatedMoods.forEach((moodEntry) => {
				const studentId = moodEntry.studentId;
				const streaksLength = moodEntry.streaks.length;

				if (!students.includes(studentId)) {
					students.push(studentId);
				}

				if (consistentStreaksInfo.has(studentId)) {
					if (streaksLength !== consistentStreaksInfo.get(studentId).streaksLength) {
						newLowMoodData = true;
					}
				} else {
					newLowMoodData = true;
				}

				consistentStreaksInfo.set(studentId, { streaksLength });
			});
		});
		return () => {
			toastChannel.unsubscribe();
			unsubscribe();
		};
	});

	$: activeUrl = $page.url.pathname;
</script>

<div class="bg-zinc-50 items-center">
	{#if $newRequest}
		<div class="px-4 pt-4">
			<Alert class="bg-blue-100 text-blue-900 flex justify-between items-center content-center">
				<BellRingSolid tabindex="-1" class="text-blue-700" />
				<div>
					<span class="font-bold text-blue-700">(NEW)</span> Help request received!
				</div>
				<CloseSolid tabindex="-1" class="cursor-pointer w-4 h-4 text-blue-500 hover:text-blue-700 focus:outline-none" on:click={() => newRequest.update(() => false)} />
			</Alert>
		</div>
	{/if}
	{#if newLowMoodData}
		<div class="px-4 pt-4">
			<Alert class="bg-red-200 flex justify-between items-center content-center text-red-900">
				<BellRingSolid tabindex="-1" class="text-red-700" />
				<div class="text-center">
					{#if activeUrl != '/dashboard'}
						To view the list of students experiencing consistent low moods for atleast 4 consecutive
						days, please navigate to <span class="font-semibold">dashboard</span>.
					{:else}
						Click 
						<span role="button" tabindex="0" class="font-bold hover:underline" on:click={() => focusTable.update(() => true)} on:keypress={() => focusTable.update(() => true)}>
							here
						</span> to view the list of students experiencing consistent low moods for atleast 4 consecutive
						days.
					{/if}
				</div>
				<CloseSolid tabindex="-1" class="cursor-pointer w-4 h-4 text-red-500 hover:text-red-700 focus:outline-none" on:click={() => (newLowMoodData = false)} />
			</Alert>
		</div>
	{/if}
	<slot />
</div>
