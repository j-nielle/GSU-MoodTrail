<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import relativeTime from 'dayjs/plugin/relativeTime';
	dayjs.extend(relativeTime);
	import { onMount } from 'svelte';
	import { ClockSolid } from 'flowbite-svelte-icons';
	import {
		P,
		Badge,
		Card,
		Search,
		Button,
		ButtonGroup,
		Select,
		Modal,
		Fileupload,
		Label,
		Dropzone
	} from 'flowbite-svelte';
	import {
		LineChart,
		HorizontalMoodBarChart,
		PieChart,
		RadarChart,
		HeatmapChart
	} from '$lib/components/charts/index.js';
	import { yearLvl } from '$lib/constants/index.js';

	export let data;
	let studentMoodData = data.studentMood;
	let students = data.students;

	$: ({ supabase } = data);

	let course;
	let college;
	let yearLevel;
	let student;

	let searchTerm = '';
	let selectedCollege;
	let selectedCourse;
	let selectedYearLevel;
	let selectedStudentName;

	let result;
	let urlResult;

	let mostFrequentMood;
	let leastFrequentMood;

	let selectedLineChart = 'today';
	let today = dayjs().format('YYYY-MM-DD');

	let timestamps, todaysMoodScores;
	let overall, overallAverages;
	let weekly, weeklyAverages;
	let monthly, monthlyAverages;
	let yearly, yearlyAverages;

	let xDataMBC, yDataMBC;
	let pieChartData;

	let lcBtnColors = {};

	let modalState = false;
	let fileValue, fileResult, fileUpload, fileInput;

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

	$: {
		if ($page.url.search != '') {
			searchTerm = $page.url.searchParams.get('search');

			urlResult = students.filter((student) => student?.id?.toString() === searchTerm);
		}
	}

	$: if (studentMoodData.length > 0) {
		college = _.uniq(studentMoodData.map((data) => data.college)).map((college) => ({
			value: college,
			name: college
		}));

		course = _.chain(studentMoodData)
			.filter({ college: selectedCollege })
			.map('course')
			.uniq()
			.sort()
			.map((course) => ({ value: course, name: course }))
			.value();

		yearLevel = _.chain(studentMoodData)
			.filter({ course: selectedCourse })
			.map('year_level')
			.uniq()
			.sort()
			.map((yearLevel) => ({ value: yearLevel, name: yearLevel }))
			.value();

		student = _.chain(studentMoodData)
			.filter({ college: selectedCollege, course: selectedCourse, year_level: selectedYearLevel })
			.map('name')
			.uniq()
			.sort()
			.map((name) => ({ value: name, name: name }))
			.value();

		// for the search filter
		result = _.filter(studentMoodData, (req) => {
			const searchTermNumeric = /^\d{10}$/.test(searchTerm);
			const idMatch = searchTermNumeric && req.student_id.toString() === searchTerm;
			const nameMatch = req.name.toLowerCase().includes(searchTerm.toLowerCase());

			const collegeMatch = !selectedCollege || req.college === selectedCollege;
			const courseMatch = !selectedCourse || req.course === selectedCourse;
			const yearLevelMatch = !selectedYearLevel || req.year_level === selectedYearLevel;
			const studentNameMatch = !selectedStudentName || req.name === selectedStudentName;

			return (
				((searchTerm != '' || $page.url.search === '') && (idMatch || nameMatch)) ||
				(selectedStudentName
					? collegeMatch && courseMatch && yearLevelMatch && studentNameMatch
					: false)
			);
		});
	}

	$: {
		// info
		const moodCount = _.countBy(result, 'mood_label');
		const sortedMoodsArr = Object.keys(moodCount).sort((a, b) => moodCount[b] - moodCount[a]);
		mostFrequentMood = sortedMoodsArr[0];
		leastFrequentMood = sortedMoodsArr.slice(-1)[0];

		// pie chart
		const sortedMoodObj = Object.fromEntries(
			Object.entries(moodCount).sort(([, a], [, b]) => a - b)
		);
		xDataMBC = _.keys(sortedMoodObj);
		yDataMBC = _.values(sortedMoodObj);

		pieChartData = xDataMBC.map((label, index) => {
			return {
				value: yDataMBC[index],
				name: label
			};
		});

		lcBtnColors = {
			today: selectedLineChart === 'today' ? 'blue' : 'light',
			overall: selectedLineChart === 'overall' ? 'blue' : 'light',
			weekly: selectedLineChart === 'weekly' ? 'blue' : 'light',
			monthly: selectedLineChart === 'monthly' ? 'blue' : 'light',
			yearly: selectedLineChart === 'yearly' ? 'blue' : 'light'
		};

		if (selectedLineChart === 'today') {
			const todaysEntries = result.filter(
				(entry) => dayjs(entry.created_at).format('YYYY-MM-DD') === today
			);
			timestamps = todaysEntries.map((entry) => dayjs(entry.created_at).format('HH:mm:ss')) || [];
			todaysMoodScores = todaysEntries.map((entry) => entry.mood_score) || [];
		} else if (selectedLineChart === 'overall') {
			const groupedByDay = _.groupBy(result, (entry) =>
				dayjs(entry.created_at).format('YYYY-MM-DD')
			);

			overallAverages = Object.values(groupedByDay).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			}) || [];

			overall = _.sortBy(_.keys(groupedByDay)) || [];
		} else if (selectedLineChart === 'weekly') {
			const groupedByWeek = _.groupBy(result, (entry) =>
				getWeekNumberString(dayjs(entry.created_at))
			);

			weeklyAverages = Object.values(groupedByWeek).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			}) || [];

			weekly = _.sortBy(_.keys(groupedByWeek), (week) => {
				const weekNumber = parseInt(week.replace('Week ', ''));
				return weekNumber;
			}) || [];
		} else if (selectedLineChart === 'monthly') {
			const groupedByMonth = _.groupBy(result, (entry) =>
				dayjs(entry.created_at).format('YYYY-MM')
			);

			monthlyAverages = Object.values(groupedByMonth).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			}) || [];

			monthly = _.sortBy(_.keys(groupedByMonth)) || [];
		} else if (selectedLineChart === 'yearly') {
			const groupedByYear = _.groupBy(result, (entry) => dayjs(entry.created_at).format('YYYY'));

			yearlyAverages = Object.values(groupedByYear).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			}) || [];

			yearly = _.sortBy(_.keys(groupedByYear)) || [];
		}
	}

	const getWeekNumberString = (date) => {
		const firstDayOfYear = dayjs(date).startOf('year').day(1);
		const weekDiff = date.diff(firstDayOfYear, 'week') + 1;
		return `Week ${weekDiff}`;
	};

	function toggleChart(chart) {
		selectedLineChart = chart;
	}
</script>

<svelte:head>
	<title>Student Chart</title>
</svelte:head>

<div class="bg-zinc-50 p-4 flex flex-col space-y-5">
	<div class="space-x-4 flex flex-row max-w-full items-end">
		<!-- dropdown filter -->
		<Select
			placeholder="College"
			class="font-normal w-2/4 h-11 bg-white"
			items={college}
			bind:value={selectedCollege}
			on:change={(e) => {
				searchTerm = '';
				selectedCourse = '';
				selectedYearLevel = '';
				selectedStudentName = '';
				selectedCollege = e.target.value;
			}}
		/>
		<Select
			placeholder="Course"
			class="font-normal w-1/5 h-11 bg-white"
			items={course}
			bind:value={selectedCourse}
			on:change={(e) => {
				searchTerm = '';
				selectedYearLevel = '';
				selectedStudentName = '';
				selectedCourse = e.target.value;
			}}
		/>
		<Select
			placeholder="Year Level"
			class="font-normal w-2/6 h-11 bg-white"
			items={yearLevel}
			bind:value={selectedYearLevel}
			on:change={(e) => {
				selectedStudentName = '';
				selectedYearLevel = e.target.value;
			}}
		/>
		<Select
			placeholder="Select a student"
			class="font-normal w-full h-11 bg-white"
			items={student}
			bind:value={selectedStudentName}
		/>
		<Button
			class="h-11"
			size="sm"
			color="red"
			on:click={() => {
				searchTerm = '';
				selectedCollege = '';
				selectedCourse = '';
				selectedYearLevel = '';
				selectedStudentName = '';
				selectedLineChart = 'today';
				goto('/dashboard/student-chart');
			}}>Reset</Button
		>
		<Button
			class="h-11"
			size="sm"
			color="purple"
			on:click={() => {
				modalState = true;
			}}>Import/Export</Button
		>
	</div>

	<div
		class="bg-white space-y-4 dark:bg-gray-800 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md p-4 sm:p-6 text-slate-950 flex flex-col"
	>
		<div class="flex space-x-6 justify-between">
			<!-- student info section -->
			<div class="flex flex-col p-5">
				<P size="2xl" weight="bold" space="wider" class="mb-2 text-center">STUDENT INFORMATION</P>
				<hr class="mb-5" />
				{#if result?.length > 0}
					<P><strong>ID:</strong> {result[0].student_id}</P>
					<P><strong>Name:</strong> {result[0].name}</P>
					<P><strong>College:</strong> {result[0].college}</P>
					<P><strong>Latest Mood:</strong> {result[result.length - 1].mood_label}</P>
					<P><strong>Most Frequent Mood:</strong> {mostFrequentMood}</P>
					<P><strong>Least Frequent Mood:</strong> {leastFrequentMood}</P>
					<div class="flex space-x-2">
						<Badge large border class="w-fit mt-2">
							<ClockSolid class="text-primary-800 dark:text-primary-400 w-fit h-2.5 mr-1.5" />
							{dayjs(result[result.length - 1].created_at).fromNow()}
						</Badge>
						<Badge large border class="w-fit mt-2">{result[0].course}</Badge>
						<Badge large border class="w-fit mt-2">{result[0].year_level}</Badge>
					</div>
				{:else if $page.url.search != ''}
					<P><strong>ID:</strong> {urlResult[0]?.id}</P>
					<P><strong>Name:</strong> {urlResult[0]?.name}</P>
					<div class="flex space-x-2">
						<Badge large border class="w-fit mt-2">{urlResult[0]?.course_id}</Badge>
						<Badge large border class="w-fit mt-2">{yearLvl[urlResult[0]?.year_level_id]}</Badge>
					</div>
				{:else}
					<P>Student not found.</P>
				{/if}
			</div>

			<div class="flex flex-col">
				<!-- line chart time intervals btns -->
				<div class="flex justify-end h-fit">
					<ButtonGroup>
						<Button color={lcBtnColors.today} on:click={() => toggleChart('today')}>Today</Button>
						<Button color={lcBtnColors.weekly} on:click={() => toggleChart('weekly')}>Weekly</Button
						>
						<Button color={lcBtnColors.monthly} on:click={() => toggleChart('monthly')}
							>Monthly</Button
						>
						<Button color={lcBtnColors.yearly} on:click={() => toggleChart('yearly')}>Yearly</Button
						>
						<Button color={lcBtnColors.overall} on:click={() => toggleChart('overall')}
							>Overall</Button
						>
					</ButtonGroup>
				</div>

				<!-- line charts -->
				{#if selectedLineChart === 'today'}
					<LineChart
						bind:xData={timestamps}
						bind:yData={todaysMoodScores}
						elementID={'IndTLC'}
						style="width:790px; height:320px;"
						title="Today's Moods"
					/>
				{:else if selectedLineChart === 'overall'}
					<LineChart
						bind:xData={overall}
						bind:yData={overallAverages}
						elementID={'IndDLC'}
						style="width:790px; height:320px;"
						title="Average Mood Overall"
					/>
				{:else if selectedLineChart === 'weekly'}
					<LineChart
						bind:xData={weekly}
						bind:yData={weeklyAverages}
						elementID={'IndWLC'}
						style="width:790px; height:320px;"
						title="Average Mood Weekly"
					/>
				{:else if selectedLineChart === 'monthly'}
					<LineChart
						bind:xData={monthly}
						bind:yData={monthlyAverages}
						elementID={'IndMLC'}
						style="width:790px; height:320px;"
						title="Average Mood Monthly"
					/>
				{:else if selectedLineChart === 'yearly'}
					<LineChart
						bind:xData={yearly}
						bind:yData={yearlyAverages}
						elementID={'IndYLC'}
						style="width:790px; height:320px;"
						title="Average Mood Yearly"
					/>
				{/if}
			</div>
		</div>

		<!-- pie chart & horizontal mood bar chart -->
		<div class="flex space-x-6 justify-between">
			<PieChart bind:data={pieChartData} elementID={'studentPC'} />
			<HorizontalMoodBarChart
				bind:xData={xDataMBC}
				bind:yData={yDataMBC}
				elementID={'studentHMBC'}
			/>
		</div>

		<div class="flex space-x-6 justify-between">
			<Card>Add new chart here like scatter clustering or whatever...</Card>
		</div>
	</div>
</div>

<Modal title="Terms of Service" bind:open={modalState} autoclose>
	<Label class="space-y-2 mb-2" bind:this={fileUpload}>
		<span>Upload data from CSV/Excel file:</span>
		<Fileupload
			bind:value={fileValue}
			bind:this={fileInput}
			accept=".csv,.xlsx"
			on:change={(e) => console.log(e)}
		/>
	</Label>
	<textarea name="" bind:this={fileResult} cols="30" rows="10" />
	<!-- <svelte:fragment slot="footer">
    <Button on:click={() => alert('Handle "success"')}>I accept</Button>
    <Button color="alternative">Decline</Button>
  </svelte:fragment> -->
</Modal>
