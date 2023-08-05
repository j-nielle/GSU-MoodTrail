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
	import HeatmapChart from '$lib/components/charts/HeatmapChart.svelte';

	export let data;
	
	let studentMoodData = [];
	let anonMoodData = []

	$: ({ supabase } = data);
	$: studentMoodData = data.studentMood;
	$: anonMoodData = data.anonMood;

	let xDataMC, yDataMC;
	let uniqueMoodLabels;
	let todayMostFreqMood, todayMostFreqReason;
	let dailyMostFreqMood, dailyMostFreqReason;
	let weeklyMostFreqMood, weeklyMostFreqReason;
	let monthlyMostFreqMood, monthlyMostFreqReason;
	let yearlyMostFreqMood, yearlyMostFreqReason;

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

	let recentStudent;

	let heatmapData;

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
			.on( 'postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'StudentMoodEntries'
				},
				(payload) => {
					studentMoodData = _.cloneDeep([...studentMoodData, payload.new]);
				}
			).on( 'postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'AnonMood'
				},
				(payload) => {
					anonMoodData = _.cloneDeep([...anonMoodData, payload.new]);
				}
			)
			.subscribe((status) => console.log('/dashboard/+page.svelte:', status));

		return () => {
			dashboardChannel.unsubscribe();
		};
	});

	$: {
		recentStudent = _.last(studentMoodData)['name'];

		const groupedData = _.groupBy(studentMoodData, (data) => {
			const date = new Date(data.created_at);
			return [date.getDay(), date.getHours()];
		});

		heatmapData = _.flatMap(groupedData, (data, key) => {
			const [day, hour] = key.split(',');
			return [[parseInt(hour), parseInt(day), data.length || '-']];
		});

		const moodCount = _.countBy(studentMoodData, 'mood_label');
		xDataMC = _.keys(moodCount);
		yDataMC = _.values(moodCount);

		uniqueMoodLabels = _.uniqBy(studentMoodData, 'mood_label').map((data) => data.mood_label);

		const groupedByMood = _.groupBy(studentMoodData, 'mood_label');
		const countReasons = _.mapValues(groupedByMood, (moodGroup) =>
			_.countBy(moodGroup, 'reason_label')
		); // for ?? chart (count of reasons for each mood)
	}

	$: if(selectedLineChart === 'today'){
		const todaysEntries = studentMoodData.filter(
			(entry) => dayjs(entry.created_at).format('YYYY-MM-DD') === today
		);

		timestamps = _.map(todaysEntries, (entry) => dayjs(entry.created_at).format('HH:mm:ss'));
		todaysMoodScores = _.map(todaysEntries, (entry) => entry.mood_score);
		const todaysMoodLabels = _.map(todaysEntries, (entry) => entry.mood_label);
		const todaysReasonLabels = _.map(todaysEntries, (entry) => entry.reason_label);
		todayMostFreqMood = _.head(_(todaysMoodLabels).countBy().entries().maxBy(_.last));
		todayMostFreqReason = _.head(_(todaysReasonLabels).countBy().entries().maxBy(_.last));
	}

	$: if(selectedLineChart === 'daily'){
		const groupedByDay = _.groupBy(studentMoodData, (entry) =>
			dayjs(entry.created_at).format('YYYY-MM-DD')
		);

		dailyAverages = _.map(groupedByDay, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		daily = _.sortBy(_.keys(groupedByDay));
		dailyMostFreqMood = _.head(_(groupedByDay).flatMap().countBy('mood_label').entries().maxBy(_.last));
		dailyMostFreqReason = _.head(_(groupedByDay).flatMap().countBy('reason_label').entries().maxBy(_.last));
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
		weeklyMostFreqMood = _.head(_(groupedByWeek).flatMap().countBy('mood_label').entries().maxBy(_.last));
		weeklyMostFreqReason = _.head(_(groupedByWeek).flatMap().countBy('reason_label').entries().maxBy(_.last));
	}
	
	$: if(selectedLineChart === 'monthly'){
		const groupedByMonth = _.groupBy(studentMoodData, (entry) =>
			dayjs(entry.created_at).format('YYYY-MM')
		);

		monthlyAverages = _.map(groupedByMonth, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		monthly = _.sortBy(_.keys(groupedByMonth));
		monthlyMostFreqMood = _.head(_(groupedByMonth).flatMap().countBy('mood_label').entries().maxBy(_.last));
		monthlyMostFreqReason = _.head(_(groupedByMonth).flatMap().countBy('reason_label').entries().maxBy(_.last));
	}

	$: if(selectedLineChart === 'yearly'){
		const groupedByYear = _.groupBy(studentMoodData, (entry) =>
			dayjs(entry.created_at).format('YYYY')
		);

		yearlyAverages = _.map(groupedByYear, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		yearly = _.sortBy(_.keys(groupedByYear));
		yearlyMostFreqMood = _.head(_(groupedByYear).flatMap().countBy('mood_label').entries().maxBy(_.last));
		yearlyMostFreqReason = _.head(_(groupedByYear).flatMap().countBy('reason_label').entries().maxBy(_.last));
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="bg-zinc-50 p-2">
	<div class="flex p-3 justify-evenly space-x-3 mt-0.5">
		<Card class="max-h-8 justify-center bg-slate-800">
			<!-- (SOON): once recentStudent gets clicked, user will be led to the individual student section/page -->
			<Label class="text-white">Recent Student: <span class="font-bold cursor-pointer">{recentStudent ?? 'N/A'}</span></Label>
		</Card>
		{#if selectedLineChart === 'today'}
			<Card class="max-h-8 justify-center bg-slate-800">
				<Label class="text-white">Most Frequent Mood: <span class="font-bold">{todayMostFreqMood ?? 'N/A'}</span></Label>
			</Card>
			<Card class="max-h-8 justify-center bg-slate-800">
				<Label class="text-white">Most Frequent Reason: <span class="font-bold">{todayMostFreqReason ?? 'N/A'}</span></Label>
			</Card>
		{:else if selectedLineChart === 'daily'}
			<Card class="max-h-8 justify-center bg-slate-800">
				<Label class="text-white">Most Frequent Mood: <span class="font-bold">{dailyMostFreqMood ?? 'N/A'}</span></Label>
			</Card>
					<Card class="max-h-8 justify-center bg-slate-800">
				<Label class="text-white">Most Frequent Reason: <span class="font-bold">{dailyMostFreqReason ?? 'N/A'}</span></Label>
			</Card>
		{:else if selectedLineChart === 'weekly'}
			<Card class="max-h-8 justify-center bg-slate-800">
				<Label class="text-white">Most Frequent Mood: <span class="font-bold">{weeklyMostFreqMood ?? 'N/A'}</span></Label>
			</Card>
			<Card class="max-h-8 justify-center bg-slate-800">
				<Label class="text-white">Most Frequent Reason: <span class="font-bold">{weeklyMostFreqReason ?? 'N/A'}</span></Label>
			</Card>
		{:else if selectedLineChart === 'monthly'}
			<Card class="max-h-8 justify-center bg-slate-800">
				<Label class="text-white">Most Frequent Mood: <span class="font-bold">{monthlyMostFreqMood ?? 'N/A'}</span></Label>
			</Card>
			<Card class="max-h-8 justify-center bg-slate-800">
				<Label class="text-white">Most Frequent Reason: <span class="font-bold">{monthlyMostFreqReason ?? 'N/A'}</span></Label>
			</Card>
		{:else if selectedLineChart === 'yearly'}
			<Card class="max-h-8 justify-center bg-slate-800">
				<Label class="text-white">Most Frequent Mood: <span class="font-bold">{yearlyMostFreqMood ?? 'N/A'}</span></Label>
			</Card>
			<Card class="max-h-8 justify-center bg-slate-800">
				<Label class="text-white">Most Frequent Reason: <span class="font-bold">{yearlyMostFreqReason ?? 'N/A'}</span></Label>
			</Card>
		{/if}
	</div>
	<div class="flex">
		<div class="m-3 p-3 flex justify-center flex-col items-center outline outline-white bg-white rounded-sm drop-shadow-xl">
			<MoodBarChart bind:xData={xDataMC} bind:yData={yDataMC} />
		</div>
		<div class="flex outline outline-white m-3 bg-white rounded-sm drop-shadow-xl">
			<div class="flex flex-col m-3">
				<div class="flex space-x-1 justify-between m-2">
					<ButtonGroup>
						<Button color="light" on:click={() => toggleChart('today')}>Today</Button>
						<Button color="light" on:click={() => toggleChart('daily')}>Daily</Button>
						<Button color="light" on:click={() => toggleChart('weekly')}>Weekly</Button>
						<Button color="light" on:click={() => toggleChart('monthly')}>Monthly</Button>
						<Button color="light" on:click={() => toggleChart('yearly')}>Yearly</Button>
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
	
	<div class="flex justify-evenly  m-3">
		<div class="bg-white rounded-sm drop-shadow-xl p-4 justify-items-center">
			<HeatmapChart {heatmapData} />
		</div>
		<Card class="max-h-8 justify-center bg-slate-800">
			<Label class="text-white">Another chart here</Label>
		</Card>
	</div>
</div>
