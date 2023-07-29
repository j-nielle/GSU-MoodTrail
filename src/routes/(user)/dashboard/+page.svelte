<script>
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import LineChart from '$lib/components/charts/LineChart.svelte';

	export let data;

	let studentMoodData = [];
	let monthlyAverages = [];
	let m_scores = [],
		m_labels = [],
		m_reasons = [],
		courses = [],
		year_lvls = [],
		timestamps = [];
	let monthly = [];

	$: ({ supabase } = data);
	$: studentMoodData = data.studentMood;

	$: {
		m_scores = studentMoodData.map((entry) => entry.mood_score);
		m_labels = studentMoodData.map((entry) => entry.mood_label);
		m_reasons = studentMoodData.map((entry) => entry.mood_reason);
		courses = studentMoodData.map((entry) => entry.course);
		year_lvls = studentMoodData.map((entry) => entry.year_level);
		timestamps = studentMoodData.map((entry) => entry.created_at);
	}

	onMount(() => {
		const dashboardChannel = supabase
			.channel('dashboard')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'StudentMoodEntries'
				},
				(payload) => {
					studentMoodData = [payload.new, ...studentMoodData];
				}
			)
			.subscribe((status) => console.log('/dashboard/+page.svelte:', status));

		return () => {
			dashboardChannel.unsubscribe();
		};
	});

	const currentDate = dayjs();
	$: {
		monthly = Array.from(
			new Set(
				timestamps
					.filter((timestamp) => {
						const date = dayjs(timestamp);
						return date.year() === currentDate.year() && date.month() === currentDate.month();
					})
					.map((timestamp) => dayjs(timestamp).format('MM-DD-YYYY'))
					.filter((dateString) => dateString !== undefined) // filter out undefined values
			)
		).sort();

		monthlyAverages = monthly.map((date) => {
			const scoresOnDate = studentMoodData
				.filter((entry) => dayjs(entry.created_at).format('MM-DD-YYYY') === date)
				.map((entry) => entry.mood_score);
			const averageScore =
				scoresOnDate.reduce((total, score) => total + score, 0) / scoresOnDate.length;
			return averageScore;
		});
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="p-10">
	<LineChart bind:xData={monthly} bind:yData={monthlyAverages} />
</div>
