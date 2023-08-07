<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { Card, Search, Button, Select } from 'flowbite-svelte';
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
	let mostFrequentMood 
	let leastFrequentMood

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

	$: {
		filteredSearch = _.filter(studentMoodData, (req) => {
			const searchTermNumeric = /^\d{10}$/.test(searchTerm);
			const idMatch = searchTermNumeric && _.includes(req.student_id.toString(), searchTerm);
			const nameMatch = _.includes(req.name.toLowerCase(), searchTerm.toLowerCase());

			return searchTerm != '' ? idMatch || nameMatch : false;
		}).sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? -1 : 1));

		const moodCounts = _.countBy(filteredSearch, 'mood_label');
		const sortedMoods = _.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a]);
		mostFrequentMood = sortedMoods[0];
		leastFrequentMood = sortedMoods[sortedMoods.length - 1];
	}

	function handleStudentNameSelection(event) {
		dropdownFilter = true;
		selectedStudentName = event.target.value;

		studentInfo = _.filter(studentMoodData, { name: selectedStudentName });
	}

	onMount(() => {
		const dashboardChannel = supabase
			.channel('dashboard')
			.on( 'postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'StudentMoodEntries'
				}, (payload) => {
					studentMoodData = _.cloneDeep([...studentMoodData, payload.new]);
				}
			).subscribe((status) => console.log('/dashboard/student-chart/+page.svelte:', status));

		return () => {
			dashboardChannel.unsubscribe();
		};
	});
</script>

<svelte:head>
	<title>Student Chart</title>
</svelte:head>

<div class="p-4 flex flex-col space-y-3">
	<Card class="space-x-4 flex flex-row max-w-full items-end">
		<div class="flex gap-2">
			<Search size="md" class="w-fit h-10" placeholder="Search for ID or name" bind:value={searchTerm}
				on:input={() => {
					selectedCourse = '';
					selectedYearLevel = '';
					selectedStudentName = '';
				}}
			/>
		</div>

		<Select placeholder="Select a course" class="font-normal" items={course} bind:value={selectedCourse}
			on:change={(e) => {
				searchTerm = '';
				selectedCourse = e.target.value;
			}}
		/>
		<Select placeholder="Select a year level" class="font-normal" items={yearLevel} bind:value={selectedYearLevel}
			on:change={(e) => {
				selectedYearLevel = e.target.value;
			}}
		/>
		<Select placeholder="Select a student" class="font-normal" items={student} bind:value={selectedStudentName}
			on:change={handleStudentNameSelection}
		/>
		<Button class="h-10" size="sm" color="red"
			on:click={() => {
        dropdownFilter = false;
				searchTerm = '';
				selectedCourse = '';
				selectedYearLevel = '';
				selectedStudentName = '';
			}}
		>
			Reset
		</Button>
	</Card>

	<Card class="text-slate-950">
		{#if searchTerm != '' && filteredSearch.length > 0}
			<h2 class="font-bold">Student Information</h2>
			<p><strong>Student ID:</strong> {filteredSearch[0].student_id}</p>
			<p><strong>Name:</strong> {filteredSearch[0].name}</p>
			<p><strong>Latest Mood:</strong> {filteredSearch[filteredSearch.length - 1].mood_label}</p>
		{:else if dropdownFilter && filteredSearch.length === 0}
			<h2 class="font-bold">Student Information</h2>
			<p><strong>Student ID:</strong> {studentInfo[0].student_id}</p>
			<p><strong>Name:</strong> {studentInfo[0].name}</p>
			<p><strong>Latest Mood:</strong> {studentInfo[studentInfo.length - 1].mood_label}</p>
		{:else if searchTerm === '' || dropdownFilter === false}
			<h2 class="font-bold">Student Information</h2>
			<h2>Student not found.</h2>
		{/if}
	</Card>
</div>
