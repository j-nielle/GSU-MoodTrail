<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { Card, Button, ButtonGroup, Label } from 'flowbite-svelte';
	import { FaceLaughOutline } from 'flowbite-svelte-icons';
	import TodayLineChart from '$lib/components/charts/TodayLineChart.svelte';
	import DailyLineChart from '$lib/components/charts/DailyLineChart.svelte';
	import WeeklyLineChart from '$lib/components/charts/WeeklyLineChart.svelte';
	import MonthlyLineChart from '$lib/components/charts/MonthlyLineChart.svelte';
	import YearlyLineChart from '$lib/components/charts/YearlyLineChart.svelte';

	export let data;
	let studentMoodData = [];

	let groupedByDay;
	let groupedByWeek;
	let groupedByMonth;
	let groupedByYear;
	let dailyAverages;
	let weeklyAverages;
	let monthlyAverages;
	let yearlyAverages;
	let daily;
	let weekly;
	let monthly;
	let yearly;

	let todaysEntries;
	let timestamps;
	let moodScores;

	let today = dayjs().format('YYYY-MM-DD');
	let selectedChart = 'today';

	function toggleChart(chart) {
		selectedChart = chart;
	}

	const getWeekNumberString = (date) => {
		const firstDayOfYear = dayjs(date).startOf('year').day(1);
		const weekDiff = date.diff(firstDayOfYear, 'week') + 1;
		return `Week ${weekDiff}`;
	};

	$: ({supabase} = data)
	$: studentMoodData = data.studentMood

	$: {  
		groupedByDay = _.groupBy(studentMoodData, (entry) => dayjs(entry.created_at).format('YYYY-MM-DD'));
		groupedByWeek = _.groupBy(studentMoodData, (entry) => getWeekNumberString(dayjs(entry.created_at)));
		groupedByMonth = _.groupBy(studentMoodData, (entry) => dayjs(entry.created_at).format('YYYY-MM'));
		groupedByYear = _.groupBy(studentMoodData, (entry) => dayjs(entry.created_at).format('YYYY'));

		dailyAverages = _.map(groupedByDay, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		weeklyAverages = _.map(groupedByWeek, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		monthlyAverages = _.map(groupedByMonth, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		yearlyAverages = _.map(groupedByYear, (moodScores) => _.meanBy(moodScores, 'mood_score'));

		daily = _.sortBy(_.keys(groupedByDay));
		weekly = _.sortBy(_.keys(groupedByWeek), (week) => {
			const weekNumber = parseInt(week.replace('Week ', ''));
			return weekNumber;
		});

		monthly = _.sortBy(_.keys(groupedByMonth));
		yearly = _.sortBy(_.keys(groupedByYear));

		todaysEntries = studentMoodData.filter(entry => dayjs(entry.created_at).format('YYYY-MM-DD') === today);
		timestamps = todaysEntries.map(entry => dayjs(entry.created_at).format('HH:mm:ss'));
		moodScores = todaysEntries.map(entry => entry.mood_score);
	}

	onMount(() => {
		const dashboardChannel = supabase
			.channel('dashboard')
			.on('postgres_changes',	{
					event: 'INSERT',
					schema: 'public',
					table: 'StudentMoodEntries'
				},(payload) => {
					if(payload.new){
						studentMoodData = _.cloneDeep([...studentMoodData, payload.new]);
					}
				}
			).subscribe((status) => console.log('/dashboard/+page.svelte:', status));

		return () => {
			dashboardChannel.unsubscribe();
		};
	});
	$: console.log("timestamps and moodScores lengths:",timestamps.length,moodScores.length)
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
			<div class="justify-start items-center content-center mb-2 space-x-1">
				<ButtonGroup>
					<Button pill color="purple" on:click={() => toggleChart('today')}>Today</Button>
					<Button pill color="purple" on:click={() => toggleChart('daily')}>Daily</Button>
					<Button pill color="purple" on:click={() => toggleChart('weekly')}>Weekly</Button>
					<Button pill color="purple" on:click={() => toggleChart('monthly')}>Monthly</Button>
					<Button pill color="purple" on:click={() => toggleChart('yearly')}>Yearly</Button>
				</ButtonGroup>
			</div>
			{#if selectedChart === 'today'}
				<TodayLineChart bind:xData={timestamps} bind:yData={moodScores} />
			{:else if selectedChart === 'daily'}
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
