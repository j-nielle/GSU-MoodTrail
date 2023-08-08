<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { Card, Search, Button, ButtonGroup, Select } from 'flowbite-svelte';
	import TodayLineChart from '$lib/components/charts/TodayLineChart.svelte';
	import DailyLineChart from '$lib/components/charts/DailyLineChart.svelte';
	import WeeklyLineChart from '$lib/components/charts/WeeklyLineChart.svelte';
	import MonthlyLineChart from '$lib/components/charts/MonthlyLineChart.svelte';
	import YearlyLineChart from '$lib/components/charts/YearlyLineChart.svelte';
	import MoodBarChart from '$lib/components/charts/MoodBarChart.svelte';
	import HeatmapChart from '$lib/components/charts/HeatmapChart.svelte';

	export let data;
	let studentMoodData = data.studentMood;

	$: ({ supabase } = data);

	let course;
	let yearLevel;
	let student;

	let searchTerm = '';
	let selectedCourse;
	let selectedYearLevel;
	let selectedStudentName;

	let studentInfo;
	let filteredSearch;

	let dropdownFilter = false;
	let mostFrequentMood;
	let leastFrequentMood;
	let countReasonsForMood;

	let selectedLineChart = 'today';
	let today = dayjs().format('YYYY-MM-DD');

	let timestamps, todaysMoodScores;
	let daily, dailyAverages;
	let weekly, weeklyAverages;
	let monthly, monthlyAverages;
	let yearly, yearlyAverages;

	$: {
		course = _.uniq(studentMoodData.map((data) => data.course)).map((course) => ({
			value: course,
			name: course
		}));

		yearLevel = _.chain(studentMoodData)
			.filter({ course: selectedCourse })
			.map('year_level')
			.uniq()
			.sort()
			.map((yearLevel) => ({ value: yearLevel, name: yearLevel }))
			.value();

		student = _.chain(studentMoodData)
			.filter({ course: selectedCourse, year_level: selectedYearLevel })
			.map('name')
			.uniq()
			.sort()
			.map((name) => ({ value: name, name: name }))
			.value();
	}

  $: if(selectedLineChart === 'today'){
    const todaysEntries = filteredSearch.filter(
			(entry) => dayjs(entry.created_at).format('YYYY-MM-DD') === today
		);
		const timestamps = todaysEntries.map((entry) => dayjs(entry.created_at).format('HH:mm:ss'));
		const todayMoodScores = todaysEntries.map((entry) => entry.mood_score);
  }

  $: {
    filteredSearch = _.filter(studentMoodData, (req) => {
      const searchTermNumeric = /^\d{10}$/.test(searchTerm);
      const searchTermAlpha = /^[a-zA-Z]{3,}$/.test(searchTerm);
      const idMatch = searchTermNumeric && req.student_id.toString() === searchTerm;
      const nameMatch = searchTermAlpha && _.includes(req.name.toLowerCase(), searchTerm.toLowerCase());
      const courseMatch = !selectedCourse || req.course === selectedCourse;
      const yearLevelMatch = !selectedYearLevel || req.year_level === selectedYearLevel;
      const studentNameMatch = !selectedStudentName || req.name === selectedStudentName;
    
      return (searchTerm !== '' && (idMatch || nameMatch)) ||
        (selectedStudentName) ? courseMatch && yearLevelMatch && studentNameMatch : false;
    }).sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? -1 : 1));

		const moodReason = filteredSearch.map((obj) => {
			return {
				mood: obj.mood_label,
				reason: obj.reason_label
			};
		});

    // basically counts the number of occurences of each mood_labels
    // sa filteredSearch 
		let { moodCounts } = filteredSearch.reduce(
			(acc, { mood_label }) => {
				acc.moodCounts[mood_label] = (acc.moodCounts[mood_label] || 0) + 1;
				return acc;
			},
			{ moodCounts: {} }
		);

		const sortedMoods = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a]);

    // basically counts the number of occurences for each reason of the most frequent mood
		const countReasons = moodReason.reduce(
      (acc, { mood, reason }) => {
        acc[mood] = acc[mood] || {};
        acc[mood][reason] = (acc[mood][reason] || 0) + 1;
        return acc;
      }, {}
    );

		mostFrequentMood = sortedMoods[0];
		leastFrequentMood = sortedMoods[sortedMoods.length - 1];

		countReasonsForMood = countReasons[sortedMoods[0]];
  }

	function toggleChart(chart) {
		selectedLineChart = chart;
	}

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
			.subscribe((status) => console.log('/dashboard/student-chart/+page.svelte:', status));

		return () => {
			dashboardChannel.unsubscribe();
		};
	});
</script>

<svelte:head>
	<title>Student Chart</title>
</svelte:head>

<div class="bg-zinc-50 p-4 flex flex-col space-y-5 outline outline-red-500 outline-1">
	<div class="space-x-4 flex flex-row max-w-full items-end">
		<div class="flex gap-2">
			<Search size="md" class="w-fit h-11 bg-white" placeholder="Search for ID or name" bind:value={searchTerm} on:input={() => {
					selectedCourse = '';
					selectedYearLevel = '';
					selectedStudentName = '';
				}}
			/>
		</div>

		<Select placeholder="Select a course" class="font-normal w-56 h-11 bg-white" items={course} bind:value={selectedCourse}
			on:change={(e) => {
				searchTerm = '';
        selectedYearLevel = '';
        selectedStudentName = '';
				selectedCourse = e.target.value;
			}}
		/>
		<Select placeholder="Select a year level" class="font-normal w-fit h-11 bg-white" items={yearLevel} bind:value={selectedYearLevel}
			on:change={(e) => {
        selectedStudentName = '';
				selectedYearLevel = e.target.value;
			}}
		/>
		<Select placeholder="Select a student" class="font-normal w-full h-11 bg-white" items={student} bind:value={selectedStudentName}
		/>
		<Button class="h-11" size="sm" color="red"
			on:click={() => {
				dropdownFilter = false;
				searchTerm = '';
				selectedCourse = '';
				selectedYearLevel = '';
				selectedStudentName = '';
			}}
		>Reset
		</Button>
	</div>

	<div class="bg-white dark:bg-gray-800 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md p-4 sm:p-6 text-slate-950 flex flex-col">
		<div class="flex flex-row space-x-6 justify-between">
			<div class="flex flex-col">
				<h2 class="font-bold">Student Information</h2>
				{#if dropdownFilter || filteredSearch.length > 0}
					<p><strong>Student ID:</strong> {filteredSearch[0].student_id}</p>
					<p><strong>Name:</strong> {filteredSearch[0].name}</p>
					<p><strong>Latest Mood:</strong> {filteredSearch[filteredSearch.length - 1].mood_label ?? 'loading...'}
					</p>
					<p><strong>Most Frequent Mood:</strong> {mostFrequentMood ?? 'loading...'}</p>
					<p><strong>Least Frequent Mood:</strong> {leastFrequentMood ?? 'loading...'}</p>
				{:else if filteredSearch.length === 0}
					<h2>Student not found.</h2>
				{/if}
			</div>

			<div class="flex justify-end h-fit">
				<ButtonGroup>
					<Button color="light" on:click={() => toggleChart('today')}>Today</Button>
					<Button color="light" on:click={() => toggleChart('daily')}>Daily</Button>
					<Button color="light" on:click={() => toggleChart('weekly')}>Weekly</Button>
					<Button color="light" on:click={() => toggleChart('monthly')}>Monthly</Button>
					<Button color="light" on:click={() => toggleChart('yearly')}>Yearly</Button>
				</ButtonGroup>
			</div>
		</div>
	</div>
</div>
