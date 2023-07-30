<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { Card, Button, ButtonGroup, Label } from 'flowbite-svelte';
	import { FaceLaughOutline } from 'flowbite-svelte-icons';
	import DailyLineChart from '$lib/components/charts/DailyLineChart.svelte';
	import WeeklyLineChart from '$lib/components/charts/WeeklyLineChart.svelte';
	import MonthlyLineChart from '$lib/components/charts/MonthlyLineChart.svelte';
	import YearlyLineChart from '$lib/components/charts/YearlyLineChart.svelte';

	export let data;

	let studentMoodData;
	let dailyAverages;
	let weeklyAverages;
	let monthlyAverages;
	let yearlyAverages;

	let timestamps;
	let m_scores;
	let daily;
	let weekly;
	let monthly;
	let yearly;

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

	function getWeekNumber(date) {
		const firstDayOfYear = dayjs(date).startOf('year').day(0);
		const weekDiff = date.diff(firstDayOfYear, 'week');
		return weekDiff + 1;
	}

	$: ({ supabase } = data);
	$: studentMoodData = data.studentMood;
	

	$: {
		const groupedByDay =  _.groupBy(studentMoodData, (entry) => dayjs(entry.created_at).format('YYYY-MM-DD'));
		const groupedByWeek = _.groupBy(studentMoodData, (entry) => getWeekNumber(dayjs(entry.created_at)));
		const groupedByMonth = _.groupBy(studentMoodData, (entry) => dayjs(entry.created_at).format('YYYY-MM'));
		const groupedByYear = _.groupBy(studentMoodData, (entry) => dayjs(entry.created_at).format('YYYY'));

		dailyAverages = _.map(groupedByDay, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		weeklyAverages = _.map(groupedByWeek, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		monthlyAverages = _.map(groupedByMonth, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		yearlyAverages = _.map(groupedByYear, (moodScores) => _.meanBy(moodScores, 'mood_score'));
	}

	let selectedChart = 'daily';

	function toggleChart(chart) {
		selectedChart = chart;
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="flex">
	<div class="flex p-3 flex-col justify-start space-y-3">
		<div class="">
			<Card class="w-48 h-10 outline outline-black outline-1 justify-center items">
				<FaceLaughOutline />
			</Card>
		</div>
		<div class="">
			<Card class="w-48 h-10 outline outline-black outline-1 justify-center items-stretch">
				<Label>Testing</Label>
			</Card>
		</div>
	</div>
	<div class="outline outline-lime-500 outline-1 flex">
		<div class="flex flex-col m-3">
			<div class="bg-blue-100 justify-start items-center content-center mb-2 space-x-1">
				<ButtonGroup>
					<Button pill color="purple" on:click={() => toggleChart('daily')}>Daily</Button>
					<Button pill color="purple" on:click={() => toggleChart('weekly')}>Weekly</Button>
					<Button pill color="purple" on:click={() => toggleChart('monthly')}>Monthly</Button>
					<Button pill color="purple" on:click={() => toggleChart('yearly')}>Yearly</Button>
				</ButtonGroup>
			</div>
			{#if selectedChart === 'daily'}
			<DailyLineChart bind:xData={daily} bind:yData={dailyAverages} />
			{:else if selectedChart === 'weekly'}
				<WeeklyLineChart bind:xData={weekly} bind:yData={weeklyAverages} />
			{:else if selectedChart === 'monthly'}
				<MonthlyLineChart bind:xData={monthly} bind:yData={monthlyAverages} />
			{:else if selectedChart === 'yearly'}
				<YearlyLineChart bind:xData={yearly} bind:yData={yearlyAverages} />
			{/if}
		</div>
	</div>
</div>
