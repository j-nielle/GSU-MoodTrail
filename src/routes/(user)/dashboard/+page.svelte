<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { Card, Button, ButtonGroup, Label } from 'flowbite-svelte';
	import { ProfileCardOutline, FaceLaughOutline, BrainOutline } from 'flowbite-svelte-icons';
	import TodayLineChart from '$lib/components/charts/TodayLineChart.svelte';
	import DailyLineChart from '$lib/components/charts/DailyLineChart.svelte';
	import WeeklyLineChart from '$lib/components/charts/WeeklyLineChart.svelte';
	import MonthlyLineChart from '$lib/components/charts/MonthlyLineChart.svelte';
	import YearlyLineChart from '$lib/components/charts/YearlyLineChart.svelte';
	import MoodBarChart from '$lib/components/charts/MoodBarChart.svelte';
	import HeatmapChart from '$lib/components/charts/HeatmapChart.svelte';
	import { consistentLowMoods } from '$lib/moodNotify.js';

	export let data;

	let studentMoodData = data.studentMood;
	let anonMoodData = data.anonMood;

	$: ({ supabase } = data);

	let xDataMBC, yDataMBC;
	//let uniqueMoodLabels;
	let todayMostFreqMood, todayMostFreqReason;
	let dailyMostFreqMood, dailyMostFreqReason;
	let weeklyMostFreqMood, weeklyMostFreqReason;
	let monthlyMostFreqMood, monthlyMostFreqReason;
	let yearlyMostFreqMood, yearlyMostFreqReason;

	let daily, dailyAverages;
	let weekly, weeklyAverages;
	let monthly, monthlyAverages;
	let yearly, yearlyAverages;

	let timestamps, todaysMoodScores;

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
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'AnonMood'
				},
				(payload) => {
					anonMoodData = _.cloneDeep([...anonMoodData, payload.new]);
				}
			)
			.subscribe((status) => console.log('/dashboard/+page.svelte:', status));

		// return () => {
		// 	dashboardChannel.unsubscribe();
		// };
	});

	$: if (studentMoodData) {
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
		xDataMBC = _.keys(moodCount) || ['-'];
		yDataMBC = _.values(moodCount) || ['-'];

		// for future use idk, i forgor
		//uniqueMoodLabels = _.uniqBy(studentMoodData, 'mood_label').map((data) => data.mood_label);

		// for ?? chart (count of reasons for each mood)
		// const groupedByMood = _.groupBy(studentMoodData, 'mood_label');
		// const countReasons = _.mapValues(groupedByMood, (moodGroup) =>
		// 	_.countBy(moodGroup, 'reason_label')
		// );
	}

	$: if (selectedLineChart === 'today') {
		const todaysEntries = _.filter(
			studentMoodData,
			(entry) => dayjs(entry.created_at).format('YYYY-MM-DD') === today
		);

		timestamps = _.map(todaysEntries, (entry) => dayjs(entry.created_at).format('HH:mm:ss'));
		todaysMoodScores = _.map(todaysEntries, (entry) => entry.mood_score);
		const todaysMoodLabels = _.map(todaysEntries, (entry) => entry.mood_label);
		const todaysReasonLabels = _.map(todaysEntries, (entry) => entry.reason_label);
		todayMostFreqMood = _.head(_(todaysMoodLabels).countBy().entries().maxBy(_.last));
		todayMostFreqReason = _.head(_(todaysReasonLabels).countBy().entries().maxBy(_.last));
	}

	$: if (selectedLineChart === 'daily') {
		const groupedByDay = _.groupBy(studentMoodData, (entry) =>
			dayjs(entry.created_at).format('YYYY-MM-DD')
		);

		dailyAverages = _.map(groupedByDay, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		daily = _.sortBy(_.keys(groupedByDay));
		dailyMostFreqMood = _.head(
			_(groupedByDay).flatMap().countBy('mood_label').entries().maxBy(_.last)
		);
		dailyMostFreqReason = _.head(
			_(groupedByDay).flatMap().countBy('reason_label').entries().maxBy(_.last)
		);
	}

	$: if (selectedLineChart === 'weekly') {
		const groupedByWeek = _.groupBy(studentMoodData, (entry) =>
			getWeekNumberString(dayjs(entry.created_at))
		);

		weeklyAverages = _.map(groupedByWeek, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		weekly = _.sortBy(_.keys(groupedByWeek), (week) => {
			const weekNumber = parseInt(week.replace('Week ', ''));
			return weekNumber;
		});
		weeklyMostFreqMood = _.head(
			_(groupedByWeek).flatMap().countBy('mood_label').entries().maxBy(_.last)
		);
		weeklyMostFreqReason = _.head(
			_(groupedByWeek).flatMap().countBy('reason_label').entries().maxBy(_.last)
		);
	}

	$: if (selectedLineChart === 'monthly') {
		const groupedByMonth = _.groupBy(studentMoodData, (entry) =>
			dayjs(entry.created_at).format('YYYY-MM')
		);

		monthlyAverages = _.map(groupedByMonth, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		monthly = _.sortBy(_.keys(groupedByMonth));
		monthlyMostFreqMood = _.head(
			_(groupedByMonth).flatMap().countBy('mood_label').entries().maxBy(_.last)
		);
		monthlyMostFreqReason = _.head(
			_(groupedByMonth).flatMap().countBy('reason_label').entries().maxBy(_.last)
		);
	}

	$: if (selectedLineChart === 'yearly') {
		const groupedByYear = _.groupBy(studentMoodData, (entry) =>
			dayjs(entry.created_at).format('YYYY')
		);

		yearlyAverages = _.map(groupedByYear, (moodScores) => _.meanBy(moodScores, 'mood_score'));
		yearly = _.sortBy(_.keys(groupedByYear));
		yearlyMostFreqMood = _.head(
			_(groupedByYear).flatMap().countBy('mood_label').entries().maxBy(_.last)
		);
		yearlyMostFreqReason = _.head(
			_(groupedByYear).flatMap().countBy('reason_label').entries().maxBy(_.last)
		);
	}
	let studentsWithConsecutiveLowMood = [];
	$: {
		const consecutiveLowMoodThreshold = 4;
		const filteredStudents = new Map();

		studentMoodData.forEach((studentMoodEntry) => {
			const { student_id, mood_score, reason_label, created_at } = studentMoodEntry;

			if (!created_at || mood_score >= 0) {
				return; // Skip entries without created_at or with non-negative mood_score
			}

			const dateKey = new Date(created_at).toLocaleDateString();

			if (!filteredStudents.has(student_id)) {
				filteredStudents.set(student_id, new Map());
			}

			const studentData = filteredStudents.get(student_id);
			if (!studentData.has(dateKey)) {
				studentData.set(dateKey, {
					moodScores: [],
					reasonLabels: []
				});
			}

			studentData.get(dateKey).moodScores.push(mood_score);
			studentData.get(dateKey).reasonLabels.push(reason_label);
		});

		const consecutiveThreshold = 4;
		let maxConsecutiveDays = 0;
		const consecutiveDaysMap = new Map();
    
		for (const [studentId, studentEntry] of filteredStudents) {
			let consecutiveDays = 0;
			let previousDate = null;

			for (const [dateKey, moodData] of studentEntry) {
				const currentDate = dayjs(dateKey);
				const moodScores = moodData.moodScores;

				if (previousDate === null) {
					consecutiveDays = 1; // Initialize the streak
				} else {
					// Check if the current date is consecutive to the previous date
					if (currentDate.diff(previousDate, 'day') === 1) {
						consecutiveDays++;
					} else {
						consecutiveDays = 1; // Reset streak if not consecutive
					}
				}

				if (consecutiveDays >= consecutiveThreshold) {
					maxConsecutiveDays = Math.max(maxConsecutiveDays, consecutiveDays);

					if (!consecutiveDaysMap.has(studentId)) {
						consecutiveDaysMap.set(studentId, []);
					}

					consecutiveDaysMap.get(studentId).push({
						startDate: previousDate.subtract(consecutiveDays - 1, 'day').format('YYYY-MM-DD'), // Corrected calculation
						endDate: currentDate.format('YYYY-MM-DD'),
						moodScores: moodScores,
						reasonLabels: moodData.reasonLabels
					});
				}

				previousDate = currentDate;
			}
		}
		console.log(consecutiveDaysMap);
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="bg-zinc-50 p-4 flex flex-col space-y-3">
	<div class="flex justify-end space-x-3 mt-0.5 outline outline-teal-500 outline-1">
		<Card class="max-h-8 w-fit justify-center drop-shadow-md flex-row items-center space-x-2">
			<!-- (SOON): once recentStudent gets clicked, user will be led to the individual student section/page -->
			<ProfileCardOutline class="text-slate-900" />
			<Label class="text-slate-900"
				>Recent Student: <span class="font-bold cursor-pointer">{recentStudent ?? 'N/A'}</span
				></Label
			>
		</Card>
		{#if selectedLineChart === 'today'}
			<Card class="max-h-8 w-fit justify-center drop-shadow-md flex-row items-center space-x-2">
				<FaceLaughOutline class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Mood: <span class="font-bold">{todayMostFreqMood ?? 'N/A'}</span></Label
				>
			</Card>
			<Card class="max-h-8 w-fit justify-center drop-shadow-md flex-row items-center space-x-2">
				<BrainOutline class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Reason: <span class="font-bold">{todayMostFreqReason ?? 'N/A'}</span
					></Label
				>
			</Card>
		{:else if selectedLineChart === 'daily'}
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<FaceLaughOutline class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Mood: <span class="font-bold">{dailyMostFreqMood ?? 'N/A'}</span></Label
				>
			</Card>
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<BrainOutline class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Reason: <span class="font-bold">{dailyMostFreqReason ?? 'N/A'}</span
					></Label
				>
			</Card>
		{:else if selectedLineChart === 'weekly'}
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<FaceLaughOutline class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Mood: <span class="font-bold">{weeklyMostFreqMood ?? 'N/A'}</span></Label
				>
			</Card>
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<BrainOutline class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Reason: <span class="font-bold">{weeklyMostFreqReason ?? 'N/A'}</span
					></Label
				>
			</Card>
		{:else if selectedLineChart === 'monthly'}
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<FaceLaughOutline class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Mood: <span class="font-bold">{monthlyMostFreqMood ?? 'N/A'}</span></Label
				>
			</Card>
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<BrainOutline class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Reason: <span class="font-bold">{monthlyMostFreqReason ?? 'N/A'}</span
					></Label
				>
			</Card>
		{:else if selectedLineChart === 'yearly'}
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<FaceLaughOutline class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Mood: <span class="font-bold">{yearlyMostFreqMood ?? 'N/A'}</span></Label
				>
			</Card>
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<BrainOutline class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Reason: <span class="font-bold">{yearlyMostFreqReason ?? 'N/A'}</span
					></Label
				>
			</Card>
		{/if}
	</div>
	<div class="flex flex-col space-y-3">
		<!-- Bar Chart and Line Chart -->
		<div class="flex justify-between outline outline-pink-500 outline-1">
			<div class="flex p-3 outline outline-blue-500 outline-1 bg-white rounded-sm drop-shadow-xl">
				<MoodBarChart bind:xData={xDataMBC} bind:yData={yDataMBC} elementID={'dashboardMBC'} />
			</div>
			<div class="flex outline outline-purple-500 outline-1 bg-white rounded-sm drop-shadow-xl">
				<div class="flex flex-col p-3">
					<div class="flex space-x-4 flex-row h-fit justify-between">
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
						<TodayLineChart
							bind:xData={timestamps}
							bind:yData={todaysMoodScores}
							elementID={'dashboardTLC'}
						/>
					{:else if selectedLineChart === 'daily'}
						<DailyLineChart
							bind:xData={daily}
							bind:yData={dailyAverages}
							elementID={'dashboardDLC'}
						/>
					{:else if selectedLineChart === 'weekly'}
						<WeeklyLineChart
							bind:xData={weekly}
							bind:yData={weeklyAverages}
							elementID={'dashboardWLC'}
						/>
					{:else if selectedLineChart === 'monthly'}
						<MonthlyLineChart
							bind:xData={monthly}
							bind:yData={monthlyAverages}
							elementID={'dashboardMLC'}
						/>
					{:else if selectedLineChart === 'yearly'}
						<YearlyLineChart
							bind:xData={yearly}
							bind:yData={yearlyAverages}
							elementID={'dashboardYLC'}
						/>
					{/if}
				</div>
			</div>
		</div>

		<!-- Heatmap Chart -->
		<div class="flex justify-start space-x-3 outline outline-fuchsia-500 outline-1">
			<div class="bg-white rounded-sm drop-shadow-xl p-4 outline outline-yellow-500 outline-1">
				<HeatmapChart {heatmapData} elementID={'dashboardHM'} />
			</div>
			<Card
				class="max-h-8 justify-center outline outline-pink-600 outline-1 bg-slate-800 flex-row items-center space-x-2"
			>
				<Label class="text-white">Another chart here</Label>
			</Card>
		</div>
	</div>
</div>
