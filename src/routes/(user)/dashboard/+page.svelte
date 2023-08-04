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
	import MoodBarChart from '$lib/components/charts/MoodBarChart.svelte';

	export let data;
	
	let studentMoodData = [];

	$: ({ supabase } = data);
	$: studentMoodData = data.studentMood;

	let xDataMC, yDataMC;
	let uniqueMoodLabels;
	let todayMostFreq;
	let dailyMostFreq;
	let weeklyMostFreq;
	let monthlyMostFreq;
	let yearlyMostFreq;

	let dailyAverages;
	let weeklyAverages;
	let monthlyAverages;
	let yearlyAverages;
	let daily;
	let weekly;
	let monthly;
	let yearly;

	let timestamps;
	let todaysMoodScores;

	let today = dayjs().format('YYYY-MM-DD');
	let selectedLineChart = 'today';

	function toggleChart(chart) {
		selectedLineChart = chart;
	}

	const getWeekNumberString = (date) => {
		const firstDayOfYear = dayjs(date).startOf('year').day(1);
		const weekDiff = date.diff(firstDayOfYear, 'week') + 1;
		return `Week ${weekDiff}`;
	};

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
					studentMoodData = _.cloneDeep([...studentMoodData, payload.new]);
				}
			)
			.subscribe((status) => console.log('/dashboard/+page.svelte:', status));

		return () => {
			dashboardChannel.unsubscribe();
		};
	});

	$: {
		const moodCount = _.countBy(studentMoodData, 'mood_label');
		xDataMC = _.keys(moodCount);
		yDataMC = _.values(moodCount);

		uniqueMoodLabels = _.uniqBy(studentMoodData, 'mood_label').map((data) => data.mood_label);

		const groupedByMood = _.groupBy(studentMoodData, 'mood_label');
		const countReasons = _.mapValues(groupedByMood, (moodGroup) =>
			_.countBy(moodGroup, 'reason_label')
		); // for stacked area chart (count of reasons for each mood)
	}

	$: if(selectedLineChart === 'today'){
		const todaysEntries = studentMoodData.filter(
			(entry) => dayjs(entry.created_at).format('YYYY-MM-DD') === today
		);

		timestamps = _.map(todaysEntries, (entry) => dayjs(entry.created_at).format('HH:mm:ss'));
		todaysMoodScores = _.map(todaysEntries, (entry) => entry.mood_score);
		todayMostFreq = _.head(_(todaysMoodScores).countBy().entries().maxBy(_.last));
	}

	$: if(selectedLineChart === 'daily'){
		const groupedByDay = _.groupBy(studentMoodData, (entry) =>
			dayjs(entry.created_at).format('YYYY-MM-DD')
		);

		dailyAverages = _.map(groupedByDay, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		daily = _.sortBy(_.keys(groupedByDay));
		dailyMostFreq = _.head(_(groupedByDay).flatMap().countBy('mood_score').entries().maxBy(_.last));
	}

	$: if(selectedLineChart === 'weekly'){
		const groupedByWeek = _.groupBy(studentMoodData, (entry) =>
			getWeekNumberString(dayjs(entry.created_at))
		);

		weeklyAverages = _.map(groupedByWeek, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		weekly = _.sortBy(_.keys(groupedByWeek), (week) => {
			const weekNumber = parseInt(week.replace('Week ', ''));
			return weekNumber;
		});
		weeklyMostFreq = _.head(_(groupedByWeek).flatMap().countBy('mood_score').entries().maxBy(_.last));
	}
	
	$: if(selectedLineChart === 'monthly'){
		const groupedByMonth = _.groupBy(studentMoodData, (entry) =>
			dayjs(entry.created_at).format('YYYY-MM')
		);

		monthlyAverages = _.map(groupedByMonth, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		monthly = _.sortBy(_.keys(groupedByMonth));
		monthlyMostFreq = _.head(_(groupedByMonth).flatMap().countBy('mood_score').entries().maxBy(_.last));
	}

	$: if(selectedLineChart === 'yearly'){
		const groupedByYear = _.groupBy(studentMoodData, (entry) =>
			dayjs(entry.created_at).format('YYYY')
		);

		yearlyAverages = _.map(groupedByYear, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		yearly = _.sortBy(_.keys(groupedByYear));
		yearlyMostFreq = _.head(_(groupedByYear).flatMap().countBy('mood_score').entries().maxBy(_.last));
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="flex">
	<!-- <div class="flex p-3 flex-col justify-start space-y-3">
		<div class="">
			{#if selectedLineChart === 'today'}
				<Card class="w-48 h-10 outline outline-black outline-1 justify-center items">
					Most Frequent: {todayMostFreq}
				</Card>
			{:else if selectedLineChart === 'daily'}
				<Card class="w-48 h-10 outline outline-black outline-1 justify-center items">
					Most Frequent: {dailyMostFreq}
				</Card>
			{:else if selectedLineChart === 'weekly'}
				<Card class="w-48 h-10 outline outline-black outline-1 justify-center items">
					Most Frequent: {weeklyMostFreq}
				</Card>
			{:else if selectedLineChart === 'monthly'}
				<Card class="w-48 h-10 outline outline-black outline-1 justify-center items">
					Most Frequent: {monthlyMostFreq}
				</Card>
			{:else if selectedLineChart === 'yearly'}
				<Card class="w-48 h-10 outline outline-black outline-1 justify-center items">
					Most Frequent: {yearlyMostFreq}
				</Card>
			{/if}
		</div>
		<div class="">
			<Card class="w-48 h-10 outline outline-black outline-1 justify-center items-stretch">
				<Label>Testing</Label>
			</Card>
		</div>
	</div> -->
	<div class="p-3 flex justify-center flex-col items-center outline outline-1">
		<MoodBarChart bind:xData={xDataMC} bind:yData={yDataMC} />
	</div>
	<div class="outline outline-lime-500 outline-1 flex">
		<div class="flex flex-col m-3">
			<div class="flex space-x-1 justify-between m-2">
				<ButtonGroup class="gap-x-px">
					<Button pill color="blue" on:click={() => toggleChart('today')}>Today</Button>
					<Button pill color="blue" on:click={() => toggleChart('daily')}>Daily</Button>
					<Button pill color="blue" on:click={() => toggleChart('weekly')}>Weekly</Button>
					<Button pill color="blue" on:click={() => toggleChart('monthly')}>Monthly</Button>
					<Button pill color="blue" on:click={() => toggleChart('yearly')}>Yearly</Button>
				</ButtonGroup>
				<ButtonGroup>
					<Button pill color="dark">Students</Button>
					<Button pill>Anonymous</Button>
				</ButtonGroup>
			</div>

			{#if selectedLineChart === 'today'}
				<TodayLineChart bind:xData={timestamps} bind:yData={todaysMoodScores} />
			{:else if selectedLineChart === 'daily'}
				<DailyLineChart bind:xData={daily} bind:yData={dailyAverages} />
			{:else if selectedLineChart === 'weekly'}
				<WeeklyLineChart bind:xData={weekly} bind:yData={weeklyAverages} />
			{:else if selectedLineChart === 'monthly'}
				<MonthlyLineChart bind:xData={monthly} bind:yData={monthlyAverages} />
			{:else if selectedLineChart === 'yearly'}
				<YearlyLineChart bind:xData={yearly} bind:yData={yearlyAverages} />
			{/if}
		</div>
	</div>
</div>
<div class="flex p-3 justify-start space-x-3">
	<Card class="outline outline-1" />
	<Card class="outline outline-1" />
	<Card class="outline outline-1" />
</div>
