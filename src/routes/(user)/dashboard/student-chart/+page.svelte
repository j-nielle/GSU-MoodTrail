<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
  import relativeTime from 'dayjs/plugin/relativeTime';
  dayjs.extend(relativeTime);
	import { onMount } from 'svelte';
  import { ClockSolid } from 'flowbite-svelte-icons';
	import { Badge, Card, Search, Button, ButtonGroup, Select } from 'flowbite-svelte';
  import {
    TodayLineChart,
    OverallLineChart,
    WeeklyLineChart,
    MonthlyLineChart,
    YearlyLineChart,
    HorizontalMoodBarChart,
    PieChart,
    HeatmapChart
  } from '$lib/components/charts/index.js';

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

	let result;

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

  let lcBtnColors = {}

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchValue = urlParams.get('search');
    if (searchValue) {
      searchTerm = searchValue;
    }

		const dashboardChannel = supabase.channel('dashboard').on( 'postgres_changes', {
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

	$: if(studentMoodData){
    // for the dropdown filter
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

    // for the search filter
    result = _.filter(studentMoodData, (req) => {
      const searchTermNumeric = /^\d{10}$/.test(searchTerm);
      const idMatch = searchTermNumeric && req.student_id.toString() === searchTerm;      
      const nameMatch = req.name.toLowerCase().includes(searchTerm.toLowerCase());

      const courseMatch = !selectedCourse || req.course === selectedCourse;
      const yearLevelMatch = !selectedYearLevel || req.year_level === selectedYearLevel;
      const studentNameMatch = !selectedStudentName || req.name === selectedStudentName;
      
      return (searchTerm !== '' && (idMatch || nameMatch)) ||
        (selectedStudentName ? (courseMatch && yearLevelMatch && studentNameMatch) : false);
    })//.sort((a, b) => (dayjs(a.created_at).isBefore(dayjs(b.created_at)) ? -1 : 1));

    // info
		let { moodCounts } = result.reduce( (acc, { mood_label }) => {
			acc.moodCounts[mood_label] = (acc.moodCounts[mood_label] || 0) + 1;
			return acc;
			}, { moodCounts: {} }
		);

		const sortedMoods = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a]);
    mostFrequentMood = sortedMoods[0];
		leastFrequentMood = sortedMoods[sortedMoods.length - 1];

    // grouped bar chart
    const moodReason = result.map((obj) => {
			return { mood: obj.mood_label, reason: obj.reason_label };
		});

		const countReasons = moodReason.reduce( (acc, { mood, reason }) => {
      acc[mood] = acc[mood] || {};
      acc[mood][reason] = (acc[mood][reason] || 0) + 1;
      return acc;
      }, {}
    );

    // pie chart
    const moodCount = _.countBy(result, 'mood_label') || [];
		xDataMBC = _.keys(moodCount);
		yDataMBC = _.values(moodCount);

    pieChartData = xDataMBC.map((label, index) => {
      return {
        value: yDataMBC[index],
        name: label
      };
    });
	}

  $: {
    lcBtnColors = {
      today: selectedLineChart === "today" ? "blue" : "light",
      overall: selectedLineChart === "overall" ? "blue" : "light",
      weekly: selectedLineChart === "weekly" ? "blue" : "light",
      monthly: selectedLineChart === "monthly" ? "blue" : "light",
      yearly: selectedLineChart === "yearly" ? "blue" : "light",
    };

    if(selectedLineChart === 'today'){
      const todaysEntries = result.filter((entry) => dayjs(entry.created_at).format('YYYY-MM-DD') === today);
      timestamps = todaysEntries.map((entry) => dayjs(entry.created_at).format('HH:mm:ss'));
      todaysMoodScores = todaysEntries.map((entry) => entry.mood_score);
    } 
    else if (selectedLineChart === 'overall') {
      const groupedByDay = _.groupBy(result, (entry) => dayjs(entry.created_at).format('YYYY-MM-DD'));
      overallAverages = _.map(groupedByDay, (moodScores) => _.meanBy(moodScores, 'mood_score'));
      overall = _.sortBy(_.keys(groupedByDay));
    } 
    else if (selectedLineChart === 'weekly') {
      const groupedByWeek = _.groupBy(result, (entry) => getWeekNumberString(dayjs(entry.created_at)));
      weeklyAverages = _.map(groupedByWeek, (moodScores) => _.meanBy(moodScores, 'mood_score'));
      weekly = _.sortBy(_.keys(groupedByWeek), (week) => {
        const weekNumber = parseInt(week.replace('Week ', ''));
        return weekNumber;
      });
    } 
    else if (selectedLineChart === 'monthly') {
      const groupedByMonth = _.groupBy(result, (entry) => dayjs(entry.created_at).format('YYYY-MM'));
      monthlyAverages = _.map(groupedByMonth, (moodScores) => _.meanBy(moodScores, 'mood_score'));
      monthly = _.sortBy(_.keys(groupedByMonth));
    } 
    else if (selectedLineChart === 'yearly') {
      const groupedByYear = _.groupBy(result, (entry) => dayjs(entry.created_at).format('YYYY'));
      yearlyAverages = _.map(groupedByYear, (moodScores) => _.meanBy(moodScores, 'mood_score'));
      yearly = _.sortBy(_.keys(groupedByYear));
	  }
  }

	function toggleChart(chart) {
		selectedLineChart = chart;
	}

  const getWeekNumberString = (date) => {
		const firstDayOfYear = dayjs(date).startOf('year').day(1);
		const weekDiff = date.diff(firstDayOfYear, 'week') + 1;
		return `Week ${weekDiff}`;
	};


</script>

<svelte:head>
	<title>Student Chart</title>
</svelte:head>

<div class="bg-zinc-50 p-4 flex flex-col space-y-5">
	<div class="space-x-4 flex flex-row max-w-full items-end">
    <!-- search filter -->
		<div class="flex gap-2">
			<Search size="md" class="w-fit h-11 bg-white" placeholder="Search for ID or name" bind:value={searchTerm} on:input={() => {
					selectedCourse = '';
					selectedYearLevel = '';
					selectedStudentName = '';
			}} />
		</div>

    <!-- dropdown filter -->
		<Select placeholder="Select a course" class="font-normal w-56 h-11 bg-white" items={course} bind:value={selectedCourse}
			on:change={(e) => {
				searchTerm = '';
        selectedYearLevel = '';
        selectedStudentName = '';
				selectedCourse = e.target.value;
		}} />
		<Select placeholder="Select a year level" class="font-normal w-fit h-11 bg-white" items={yearLevel} bind:value={selectedYearLevel}
			on:change={(e) => {
        selectedStudentName = '';
				selectedYearLevel = e.target.value;
		}} />
		<Select placeholder="Select a student" class="font-normal w-full h-11 bg-white" items={student} bind:value={selectedStudentName} />
		<Button class="h-11" size="sm" color="red"
			on:click={() => {
				searchTerm = '';
				selectedCourse = '';
				selectedYearLevel = '';
				selectedStudentName = '';
        selectedLineChart = 'today';
		}}>Reset</Button>
	</div>

	<div class="bg-white space-y-4 dark:bg-gray-800 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 divide-gray-200 dark:divide-gray-700 shadow-md p-4 sm:p-6 text-slate-950 flex flex-col">
		<div class="flex space-x-6 justify-between">
      <!-- student info section -->
			<div class="flex flex-col p-5">
				<h2 class="font-bold mb-2 text-xl">STUDENT INFORMATION</h2>
        <hr class="mb-5">
				{#if result?.length > 0}
					<p><strong>ID:</strong> {result[0].student_id}</p>
					<p><strong>Name:</strong> {result[0].name}</p>
					<p><strong>Latest Mood:</strong> {result[result.length - 1].mood_label}</p>
					<p><strong>Most Frequent Mood:</strong> {mostFrequentMood}</p>
					<p><strong>Least Frequent Mood:</strong> {leastFrequentMood}</p>
          <div class="flex space-x-2">
            <Badge large border class="w-fit mt-2">
              <ClockSolid class="text-primary-800 dark:text-primary-400 w-2.5 h-2.5 mr-1.5" />
              { dayjs(result[result.length - 1].created_at).fromNow() }
            </Badge>
            <Badge large border class="w-fit mt-2">{result[0].course}</Badge>
            <Badge large border class="w-fit mt-2">{result[0].year_level}</Badge>
          </div>
				{:else if result.length === 0}
					<h2>Student not found.</h2>
				{/if}
			</div>

			<div class="flex flex-col">
        <!-- line chart time intervals btns -->
        <div class="flex justify-end h-fit">
          <ButtonGroup>
            <Button color={lcBtnColors.today} on:click={() => toggleChart('today')}>Today</Button>
						<Button color={lcBtnColors.weekly} on:click={() => toggleChart('weekly')}>Weekly</Button>
						<Button color={lcBtnColors.monthly} on:click={() => toggleChart('monthly')}>Monthly</Button>
						<Button color={lcBtnColors.yearly} on:click={() => toggleChart('yearly')}>Yearly</Button>
            <Button color={lcBtnColors.overall} on:click={() => toggleChart('overall')}>Overall</Button>
          </ButtonGroup>
        </div>

        <!-- line charts -->
        {#if selectedLineChart === 'today'}
          <TodayLineChart bind:xData={timestamps} bind:yData={todaysMoodScores} elementID={'IndTLC'} />
        {:else if selectedLineChart === 'overall'}
          <OverallLineChart bind:xData={overall} bind:yData={overallAverages} elementID={'IndDLC'} />
        {:else if selectedLineChart === 'weekly'}
          <WeeklyLineChart bind:xData={weekly} bind:yData={weeklyAverages} elementID={'IndWLC'} />
        {:else if selectedLineChart === 'monthly'}
          <MonthlyLineChart bind:xData={monthly} bind:yData={monthlyAverages} elementID={'IndMLC'} />
        {:else if selectedLineChart === 'yearly'}
          <YearlyLineChart bind:xData={yearly} bind:yData={yearlyAverages} elementID={'IndYLC'} />
        {/if}
      </div>
		</div>

    <!-- pie chart & horizontal mood bar chart -->
    <div class="flex space-x-6 justify-between">
      <PieChart bind:data={pieChartData} elementID={'studentPC'} />
      <HorizontalMoodBarChart bind:xData={xDataMBC} bind:yData={yDataMBC} elementID={'studentHMBC'} />
    </div>
	</div>
</div>