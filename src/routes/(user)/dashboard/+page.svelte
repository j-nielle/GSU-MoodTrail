<script>
	import { onMount } from 'svelte';

	export let data;
	let studentMoodData = [];

	$: ({ supabase } = data);
	$: studentMoodData = data.studentMood;
	
	onMount(() => {
		const dashboardChannel = supabase
			.channel('dashboard')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'StudentMoodEntries'
				},
				(payload) => {
					studentMoodData = [payload.new, ...studentMoodData];
				}
			)
			.subscribe((status) => console.log("inside /dashboard/+page.svelte",status));

		return () => {
			dashboardChannel.unsubscribe();
		};
	});

</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="p-10">
</div>
