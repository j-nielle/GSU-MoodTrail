<script>
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
		timestamps = studentMoodData.map((entry) => dayjs(entry.created_at));
		m_scores = studentMoodData.map((entry) => entry.mood_score);

		const groupedByDay = {};
		const groupedByWeek = {};
		const groupedByMonth = {};
		const groupedByYear = {};

		// forEach expects 2 arguments but we only need index here
		studentMoodData.forEach((_, index) => {
			const date = timestamps[index];
			const formattedDate = date.format('YYYY-MM-DD');

			if (!groupedByDay[formattedDate]) {
				groupedByDay[formattedDate] = [];
			}
			groupedByDay[formattedDate].push(m_scores[index]);

			const weekNumber = getWeekNumber(date);
			if (!groupedByWeek[weekNumber]) {
				groupedByWeek[weekNumber] = [];
			}
			groupedByWeek[weekNumber].push(m_scores[index]);

			const formattedMonth = date.format('YYYY-MM');
			if (!groupedByMonth[formattedMonth]) {
				groupedByMonth[formattedMonth] = [];
			}
			groupedByMonth[formattedMonth].push(m_scores[index]);

			const formattedYear = date.format('YYYY');
			if (!groupedByYear[formattedYear]) {
				groupedByYear[formattedYear] = [];
			}
			groupedByYear[formattedYear].push(m_scores[index]);
		});

		daily = Object.keys(groupedByDay).sort();
		weekly = Object.keys(groupedByWeek).sort();
		monthly = Object.keys(groupedByMonth).sort();
		yearly = Object.keys(groupedByYear).sort();

		dailyAverages = daily.map(
			(date) =>
				groupedByDay[date].reduce((sum, score) => sum + score, 0) / groupedByDay[date].length
		);
		weeklyAverages = weekly.map(
			(week) =>
				groupedByWeek[week].reduce((sum, score) => sum + score, 0) / groupedByWeek[week].length
		);
		monthlyAverages = monthly.map(
			(month) =>
				groupedByMonth[month].reduce((sum, score) => sum + score, 0) / groupedByMonth[month].length
		);
		yearlyAverages = yearly.map(
			(year) =>
				groupedByYear[year].reduce((sum, score) => sum + score, 0) / groupedByYear[year].length
		);
	}

	let selectedChart = 'daily'; // set to 'daily' by default

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
