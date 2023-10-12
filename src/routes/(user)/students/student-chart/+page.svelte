<script>
	// @ts-nocheck
	import { enhance } from '$app/forms';
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	// import relativeTime from 'dayjs/plugin/relativeTime';
	// dayjs.extend(relativeTime);
	import { onMount } from 'svelte';
	import {
		//ClockSolid,
		RocketOutline,
	} from 'flowbite-svelte-icons';
	import {
		P,
		//Badge,
		Card,
		Button,
		ButtonGroup,
		Select,
		Avatar,
		Modal,
		Alert
	} from 'flowbite-svelte';
	import {
		LineChart,
		SimpleBarChart,
		PieChart,
		//RadarChart,
		//HeatmapChart
	} from '$lib/components/charts/index.js';
	import { PrintSolid } from 'flowbite-svelte-icons';
	import { yearLvl, mood, reason } from '$lib/constants/index.js';
	import { InputHelper } from '$lib/components/elements/index.js';

	export let data;
	export let form;

	let studentMoodData = data.studentMood;
	let students = data.students;

	$: ({ supabase } = data);

	let course = [], college = [], yearLevel = [], student = [];

	let searchURL = $page?.url?.searchParams?.get('search') || '';
	let searchTerm = '';
	let selectedCollege = '';
	let selectedCourse = '';
	let selectedYearLevel = '';
	let selectedStudent = '';

	let result = {};
	let urlResult = {};
	let hasEntry;

	let mostFrequentMood,leastFrequentMood;

	let selectedLineChart = 'today';
	let today = dayjs().format('YYYY-MM-DD');

	let timestamps, todaysMoodScores;
	let overall, overallAverages;
	let weekly, weeklyAverages;
	let monthly, monthlyAverages;
	let yearly, yearlyAverages;

	let xDataMBC, yDataMBC;
	let xDataSBC, yDataSBC;
	let selectedReasonMarkType = 'average', sbcMarkType = '', sbcBtnColors = {};
	let pieChartData, lcBtnColors = {};

	let newMoodEntry = false;

	const divClass = "bg-white space-y-4 dark:bg-gray-800 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md p-4 sm:p-6 text-slate-950 flex flex-col";

	const moodChoices = Object.keys(mood).map(key => ({ value: mood[key], name: key }));
	const reasonChoices = Object.keys(reason).map(key => ({ value: reason[key], name: key }));

	let currentStudentID;

	onMount(() => {
		const studentChartChannel = supabase.channel('studentChartChannel')
			.on('postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'StudentMoodEntries'
				},(payload) => {
					studentMoodData = _.cloneDeep([...studentMoodData, payload.new]);
				}
			).subscribe((status) => console.log('/students/student-chart', status));

		return () => {
			studentChartChannel.unsubscribe();
		};
	});

	$: {
		searchTerm = $page?.url?.searchParams?.get('search');
		if (selectedStudent) {
			searchTerm = selectedStudent
		}
		hasEntry = studentMoodData?.find((student) => student.student_id == searchTerm);
		
		if (hasEntry) {
			urlResult = {};
			result = studentMoodData?.filter((student) => student?.student_id == searchTerm);
			currentStudentID = result[0]?.student_id;
		} else if (hasEntry === undefined){
			result = {};
			urlResult = students?.filter((student) => student?.id == searchTerm);
			currentStudentID = urlResult[0]?.id;
		}
	}

	$: if (studentMoodData?.length > 0) {
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
			.map('student_id')
			.uniq()
			.map((studentId) => ({
				value: studentId,
				name: studentMoodData.find((student) => student.student_id === studentId).name
			}))
			.sort()
			.value();
	}

	$: if (result?.length > 0) {
		const moodCount = {};
		const reasonCount = {};

		result.forEach((item) => {
			const moodScore = item.mood_score;
			let moodLabel = null;

			for (const key in mood) {
				if (mood[key] == moodScore) {
					moodLabel = key;
					break;
				}
			}

			if (moodLabel) {
				moodCount[moodLabel] = (moodCount[moodLabel] || 0) + 1;
			}
		});

		result.forEach((item) => {
			const reasonScore = item.reason_score;
			let reasonLabel = null;

			for (const key in reason) {
				if (reason[key] == reasonScore) {
					reasonLabel = key;
					break;
				}
			}

			if (reasonLabel) {
				reasonCount[reasonLabel] = (reasonCount[reasonLabel] || 0) + 1;
			}
		});

		const sortedMoodsArr = Object.keys(moodCount)
			.sort((currElem, nxtElem) => moodCount[nxtElem] - moodCount[currElem]);
		
		// Get the m_counts of each mood
		const m_counts = Object.values(moodCount);
		
		// Check if all moods are equally frequent
		if (m_counts.every(count => count === m_counts[0])) {
				mostFrequentMood = 'Equal mood frequency';
				leastFrequentMood = 'Equal mood frequency';
		} else {
				// Get the mood(s) with the maximum count
				const maxCount = Math.max(...m_counts);
				const mostFrequentMoods = sortedMoodsArr.filter(mood => moodCount[mood] === maxCount);

				// If there's a tie for the most frequent mood, set mostFrequentMood to 'Tie'
				mostFrequentMood = mostFrequentMoods.length > 1 ? 'A tie.' : mostFrequentMoods[0];

				// Get the mood(s) with the minimum count
				const minCount = Math.min(...m_counts);
				const leastFrequentMoods = sortedMoodsArr.filter(mood => moodCount[mood] === minCount);

				// If there's a tie for the least frequent mood, set leastFrequentMood to 'Tie'
				leastFrequentMood = leastFrequentMoods.length > 1 ? 'A tie.' : leastFrequentMoods[0];
		}

		// pie chart
		const sortedMoodObj = Object.fromEntries(
			Object.entries(moodCount).sort(([, currElem], [, nextElem]) => currElem - nextElem)
		);

		xDataMBC = _.keys(sortedMoodObj);
		yDataMBC = _.values(sortedMoodObj);

		pieChartData = xDataMBC.map((label, index) => {
			return {
				value: yDataMBC[index],
				name: label
			};
		});

		const sortedReasonObj = Object.fromEntries(
			Object.entries(reasonCount).sort(([, currElem], [, nextElem]) => currElem - nextElem)
		);

		xDataSBC = _.keys(sortedReasonObj);
		yDataSBC = _.values(sortedReasonObj);

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

			overallAverages =
				Object.values(groupedByDay).map((entries) => {
					const totalMoodScore = entries.reduce(
						(sum, entry) => sum + parseInt(entry.mood_score),
						0
					);
					const averageMoodScore = totalMoodScore / entries.length;
					return averageMoodScore;
				}) || [];

			overall = _.sortBy(_.keys(groupedByDay)) || [];
		} else if (selectedLineChart === 'weekly') {
			const groupedByWeek = _.groupBy(result, (entry) =>
				getWeekNumberString(dayjs(entry.created_at))
			);

			weeklyAverages =
				Object.values(groupedByWeek).map((entries) => {
					const totalMoodScore = entries.reduce(
						(sum, entry) => sum + parseInt(entry.mood_score),
						0
					);
					const averageMoodScore = totalMoodScore / entries.length;
					return averageMoodScore;
				}) || [];

			weekly =
				_.sortBy(_.keys(groupedByWeek), (week) => {
					const weekNumber = parseInt(week.replace('Week ', ''));
					return weekNumber;
				}) || [];
		} else if (selectedLineChart === 'monthly') {
			const groupedByMonth = _.groupBy(result, (entry) =>
				dayjs(entry.created_at).format('YYYY-MM')
			);

			monthlyAverages =
				Object.values(groupedByMonth).map((entries) => {
					const totalMoodScore = entries.reduce(
						(sum, entry) => sum + parseInt(entry.mood_score),
						0
					);
					const averageMoodScore = totalMoodScore / entries.length;
					return averageMoodScore;
				}) || [];

			monthly = _.sortBy(_.keys(groupedByMonth)) || [];
		} else if (selectedLineChart === 'yearly') {
			const groupedByYear = _.groupBy(result, (entry) => dayjs(entry.created_at).format('YYYY'));

			yearlyAverages =
				Object.values(groupedByYear).map((entries) => {
					const totalMoodScore = entries.reduce(
						(sum, entry) => sum + parseInt(entry.mood_score),
						0
					);
					const averageMoodScore = totalMoodScore / entries.length;
					return averageMoodScore;
				}) || [];

			yearly = _.sortBy(_.keys(groupedByYear)) || [];
		}

		sbcBtnColors = {
			min: selectedReasonMarkType === 'min' ? 'blue' : 'light',
			max: selectedReasonMarkType === 'max' ? 'blue' : 'light',
			average: selectedReasonMarkType === 'average' ? 'blue' : 'light'
		};

		if(selectedReasonMarkType === 'average') { sbcMarkType = 'average' }
		else if(selectedReasonMarkType === 'min') { sbcMarkType = 'min' }
		else if(selectedReasonMarkType === 'max') { sbcMarkType = 'max' }
	}

	const getWeekNumberString = (date) => {
		const firstDayOfYear = dayjs(date).startOf('year').day(1);
		const weekDiff = date.diff(firstDayOfYear, 'week') + 1;
		return `Week ${weekDiff}`;
	};

	function toggleChart(chart) {
		selectedLineChart = chart;
	}

	function selectReasonMarkType(reasonMarkType) {
		selectedReasonMarkType = reasonMarkType;
	}

	function handlePrint() {
		window.print();
	}
</script>

<svelte:head>
	<title>Student Mood Charts</title>
</svelte:head>

<div class="p-4 flex flex-col space-y-3.5">
	<div class="space-x-2 flex flex-row max-w-full justify-center">
		{#if urlResult?.length > 0}
			<div class="space-x-2">
				<Button class="h-11 w-fit" size="sm" color="dark" on:click={() => goto('/students/all-students')}>
					Back to Student List
				</Button>
				<Button class="h-11 w-fit" size="sm" color="green" on:click={() => { newMoodEntry = true; }}>
					New Mood Entry
				</Button>
				<Button class="h-11 shadow-md p-4 items-center" on:click={handlePrint}>
					<span class="mr-3">Print</span>
					<PrintSolid tabindex="-1" class="text-white focus:outline-none" />
				</Button>
			</div>
		{:else if studentMoodData?.length > 0}
			<Select placeholder="College"	class="font-normal w-max h-11 bg-white" items={college} bind:value={selectedCollege}
				on:change={(e) => {
					selectedCourse = '';
					selectedYearLevel = '';
					selectedStudent = '';
					selectedCollege = e.target.value;
				}}
			/>
			<Select placeholder="Course" class="font-normal w-max h-11 bg-white"
				items={course} bind:value={selectedCourse}
				on:change={(e) => {
					selectedYearLevel = '';
					selectedStudent = '';
					selectedCourse = e.target.value;
				}}
			/>
			<Select placeholder="Year Level" class="font-normal w-max h-11 bg-white" items={yearLevel} bind:value={selectedYearLevel}
				on:change={(e) => {
					selectedStudent = '';
					selectedYearLevel = e.target.value;
				}}
			/>
			<Select placeholder="Select a student" class="font-normal w-max h-11 bg-white" items={student} bind:value={selectedStudent}
				on:input={(e) => {
					selectedStudent = e.target.value;
				}}
			/>
			<Button class="h-11 w-fit" size="sm" color="red"
				on:click={() => {
					searchTerm = '';
					selectedCollege = '';
					selectedCourse = '';
					selectedYearLevel = '';
					selectedStudent = '';
					selectedLineChart = 'today';
				}}>Reset</Button
			>
			<div class="space-x-2">
				{#if selectedStudent || currentStudentID}
					<Button class="h-11 w-fit" size="sm" color="green" on:click={() => { newMoodEntry = true; }}>
						New Mood Entry
					</Button>
				{/if}
				<Button class="h-11 shadow-md p-4 items-center" on:click={handlePrint}>
					<span class="mr-3">Print</span>
					<PrintSolid tabindex="-1" class="text-white focus:outline-none" />
				</Button>
			</div>
		{/if}
	</div>
	
	<div class={divClass}>
		<div class="flex space-x-6 justify-between">
			<div class="flex flex-col p-5">
				{#if form?.success}
					<Alert color="green" class="mb-2"><span class="font-medium">Mood entry added succesfully!</span></Alert>
				{:else if form?.error}
					<Alert color="red" class="mb-2"><span class="font-medium">{form?.error}</span></Alert>
				{/if}
				{#if urlResult?.length > 0}
					<Card class="max-w-full">
						<div class="flex flex-row space-x-8">
							<div class="self-start">
								<Avatar size="lg" src="" border rounded />
							</div>
							<div class="flex flex-col">
								<h5 class="text-xl font-medium text-zinc-800 max-w-sm">{urlResult[0]?.name}</h5>
								<span class="text-sm text-gray-500 dark:text-gray-400">{urlResult[0]?.id}</span>
								<div class="flex mt-5 space-x-10">
									<div class="flex flex-col">
										<p class="text-sm font-semibold text-zinc-800">COURSE</p>
										<p class="text-sm">{urlResult[0]?.course_id}</p>
									</div>
									<div class="flex flex-col">
										<p class="text-sm font-semibold text-zinc-800">YEAR LEVEL</p>
										<p class="text-sm">{yearLvl[urlResult[0]?.year_level_id]}</p>
									</div>
								</div>
							</div>
						</div>
					</Card>
					<p class="italic mt-4 text-sm">*This student have yet to have mood entries.</p>
				{:else if result?.length > 0}
					<Card class="max-w-full">
						<div class="flex flex-row space-x-8">
							<div class="self-start">
								<Avatar size="lg" src="" border rounded />
							</div>
							<div class="flex flex-col">
								<h5 class="text-xl font-medium text-zinc-800 max-w-sm">{result[0]?.name}</h5>
								<span class="text-sm text-gray-500 dark:text-gray-400">{result[0].student_id}</span>
								<div class="flex mt-5">
									<div class="flex flex-col">
										<p class="text-sm font-semibold text-zinc-800">COLLEGE</p>
										<p class="text-sm">{result[0]?.college}</p>
									</div>
								</div>
								<div class="flex mt-5 space-x-10">
									<div class="flex flex-col">
										<p class="text-sm font-semibold text-zinc-800">COURSE</p>
										<p class="text-sm">{result[0]?.course}</p>
									</div>
									<div class="flex flex-col">
										<p class="text-sm font-semibold text-zinc-800">YEAR LEVEL</p>
										<p class="text-sm">{yearLvl[parseInt(result[0].year_level)]}</p>
									</div>
								</div>
								<div class="flex flex-col mt-5 space-y-3">
									<div class="flex flex-col">
										<p class="text-sm">
											<span class="text-sm font-semibold text-zinc-800">Latest Mood:</span>
											{Object.keys(mood).find((key) => mood[key] == result[result?.length - 1].mood_score)}
											[{Object.keys(reason).find((key) => reason[key] == result[result?.length - 1].reason_score)}]
										</p>
										<p class="text-sm">
											<span class="text-sm font-semibold text-zinc-800">Most Frequent:</span>
											{mostFrequentMood}
										</p>
										<p class="text-sm">
											<span class="text-sm font-semibold text-zinc-800">Least Frequent:</span>
											{leastFrequentMood}
										</p>
									</div>
								</div>
							</div>
						</div>
					</Card>
					<!-- <div class="flex space-x-2">
						<Badge large border class="w-fit mt-2">
							<ClockSolid class="text-primary-800 dark:text-primary-400 w-fit h-2.5 mr-1.5" />
							{dayjs(result[result.length - 1].created_at).fromNow()}
						</Badge>
					</div> -->
				{:else}
					<P>Student not found.</P>
				{/if}
			</div>

			{#if result?.length > 0}
				<div class="flex flex-col">
					<div class="flex justify-end h-fit">
						<ButtonGroup>
							<Button color={lcBtnColors.today} on:click={() => toggleChart('today')}>
								Today
							</Button>
							<Button color={lcBtnColors.weekly} on:click={() => toggleChart('weekly')}>
								Weekly
							</Button>
							<Button color={lcBtnColors.monthly} on:click={() => toggleChart('monthly')}>
								Monthly
							</Button>
							<Button color={lcBtnColors.yearly} on:click={() => toggleChart('yearly')}>
								Yearly
							</Button>
							<Button color={lcBtnColors.overall} on:click={() => toggleChart('overall')}>
								Overall
							</Button>
						</ButtonGroup>
					</div>

					{#if selectedLineChart === 'today'}
						<LineChart
							bind:xData={timestamps}
							bind:yData={todaysMoodScores}
							elementID={'IndTLC'}
							style="width:700px; height:320px;"
						/>
					{:else if selectedLineChart === 'overall'}
						<LineChart
							bind:xData={overall}
							bind:yData={overallAverages}
							elementID={'IndDLC'}
							style="width:700px; height:320px;"
						/>
					{:else if selectedLineChart === 'weekly'}
						<LineChart
							bind:xData={weekly}
							bind:yData={weeklyAverages}
							elementID={'IndWLC'}
							style="width:700px; height:320px;"
						/>
					{:else if selectedLineChart === 'monthly'}
						<LineChart
							bind:xData={monthly}
							bind:yData={monthlyAverages}
							elementID={'IndMLC'}
							style="width:700px; height:320px;"
						/>
					{:else if selectedLineChart === 'yearly'}
						<LineChart
							bind:xData={yearly}
							bind:yData={yearlyAverages}
							elementID={'IndYLC'}
							style="width:700px; height:320px;"
						/>
					{/if}
				</div>
			{/if}
		</div>

		<div class="flex flex-row space-x-3 justify-between">
			{#if result?.length > 0}
			<div class="flex space-x-6 justify-between">
				<PieChart title="Breakdown of Moods" bind:data={pieChartData} elementID={'studentPC'} />
			</div>

			<div class="flex space-x-6">
				<div class="flex flex-col">
					{#if result?.length > 0}
					<div class="flex justify-between">
						<div class="flex flex-col">
							<p class="text-lg font-bold ml-1">Associated Reason Frequency</p>
						</div>
						<ButtonGroup class="mb-3">
							<Button color={sbcBtnColors.average} 
								on:click={() => selectReasonMarkType('average')}>
								Average
							</Button>
							<Button color={sbcBtnColors.max}
								on:click={() => selectReasonMarkType('max')}>
								Max
							</Button>
							<Button color={sbcBtnColors.min} 
								on:click={() => selectReasonMarkType('min')}>
								Min
							</Button>
						</ButtonGroup>
					</div>
					<div class="mt-3 items-center">
						<SimpleBarChart
							xData={xDataSBC}
							yData={yDataSBC}
							title=""
							markType={sbcMarkType}
							elementID="reasonSBC"
							style="width:645px; height:320px;"
						/>
					</div>
					{:else}
						<div class="flex flex-col justify-center items-center space-y-5" style="width:645px; height:320px;">
							<RocketOutline class="h-20 w-20" />
							<p class="text-sm text-slate-500">Data currently <strong>unavailable</strong>.</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}
		</div>
	</div>
</div>

<Modal title="Add New Mood Entry" size="xs" bind:open={newMoodEntry} class="w-full">
	<form class="flex flex-col" method="POST" action="?/addMoodEntry" use:enhance>
		<p class="text-sm mb-3"><strong>Student ID:</strong> {currentStudentID}</p>
		<input type="hidden" id="studentID" name="studentID" bind:value={currentStudentID} />

		<div class="flex flex-row space-x-3">
			<Select size="sm" class="my-2" items={moodChoices} placeholder="Select Mood" name="addMood" 
				required />
			<Select size="sm" class="my-2" items={reasonChoices} placeholder="Select Reason" name="addReason" 
				required />
		</div>

		<Button type="submit" class="w-full mt-3" on:click={() => newMoodEntry = false}>SAVE MOOD ENTRY</Button>
	</form>
</Modal>