<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
  import { fade, fly, slide } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { 
    Card, 
    Button, 
    ButtonGroup, 
    Label,
    Select,
    Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
  } from 'flowbite-svelte';
	import { PrintSolid } from 'flowbite-svelte-icons';
  import {
    TodayLineChart,
    OverallLineChart,
    WeeklyLineChart,
    MonthlyLineChart,
    YearlyLineChart,
    HorizontalMoodBarChart,
    HeatmapChart
  } from '$lib/components/charts/index.js';
	import { focusTable, consistentLowMoods } from '$lib/stores/index.js';
  import { CardInfo } from '$lib/components/elements/index.js'

	export let data;

	let studentMoodData = data.studentMood;
	let anonMoodData = data.anonMood;
  let dataType = []
  
  let todaysEntries = [];
	let xDataMBC, yDataMBC;
	let todayMostFreqMood = [], todayMostFreqReason = [];
	let overallMostFreqMood = [], overallMostFreqReason = [];
	let weeklyMostFreqMood = [], weeklyMostFreqReason = [];
	let monthlyMostFreqMood = [], monthlyMostFreqReason = [];
	let yearlyMostFreqMood = [], yearlyMostFreqReason = [];

	let overall = [], overallAverages = [];
	let weekly = [], weeklyAverages = [];
	let monthly = [], monthlyAverages = [];
	let yearly = [], yearlyAverages = [];
	let timestamps = [], todaysMoodScores = [];

	let recentStudent;
	let heatmapData;
	let selectedLineChart = 'today';
  const moodLabels = ['Sad', 'Annoyed', 'Nervous', 'Bored', 'Neutral', 'Calm', 'Relaxed', 'Happy', 'Excited'];

  let current = dayjs().format('ddd MMMM D, YYYY h:mm:ss A');
  const interval = 1000; 

  let tableRef;
  let viewAnonData = false;
  let lcBtnColors = {}

  let filteredProperties;
  let controlState = false
  let averageMoodByReason;
  let xAxisScatter, yAxisScatter;

  $: ({ supabase } = data);

	onMount(() => {
    //const timer = setInterval(updateCurrent, interval);

		const dashboardChannel = supabase
			.channel('dashboard')
			.on('postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'StudentMoodEntries'
				}, (payload) => {
					studentMoodData = _.cloneDeep([...studentMoodData, payload.new]);
				}
			).on('postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'AnonMoodEntries'
				}, (payload) => {
					anonMoodData = _.cloneDeep([...anonMoodData, payload.new]);
				}
			).subscribe((status) => console.log('inside dashboard page', status));

		return () => {
      //clearInterval(timer);
			dashboardChannel.unsubscribe();
		};
	});

  $: controlsText = controlState ? "Show Controls" : "Hide Controls"
  $: viewAnonData ? dataType = anonMoodData : dataType = studentMoodData;

	$: if(dataType.length > 0){
		const groupedData = _.groupBy(dataType, (data) => {
			const date = new Date(data.created_at);
			return [date.getDay(), date.getHours()];
		});

		heatmapData = _.flatMap(groupedData, (data, key) => {
			const [day, hour] = key.split(',');
			return [[parseInt(hour), parseInt(day), data.length || '-']];
		});

    // horizontal mood bar chart
		const moodCount = _.countBy(dataType, 'mood_label');
    const sortedMoodCount = Object.fromEntries(Object.entries(moodCount).sort(([, a], [, b]) => a - b));

		xDataMBC = _.keys(sortedMoodCount);
		yDataMBC = _.values(sortedMoodCount);

    // line charts
    lcBtnColors = {
      today: selectedLineChart === "today" ? "blue" : "light",
      overall: selectedLineChart === "overall" ? "blue" : "light",
      weekly: selectedLineChart === "weekly" ? "blue" : "light",
      monthly: selectedLineChart === "monthly" ? "blue" : "light",
      yearly: selectedLineChart === "yearly" ? "blue" : "light",
    };

    if(selectedLineChart === 'today'){
      todaysEntries = _.filter(
        dataType, (entry) => dayjs(entry.created_at).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
      );   
      timestamps = _.map(todaysEntries, (entry) => dayjs(entry.created_at).format('HH:mm:ss'));
      todaysMoodScores = _.map(todaysEntries, (entry) => entry.mood_score);
      const todaysMoodLabels = _.map(todaysEntries, (entry) => entry.mood_label) || [];
      const todaysReasonLabels = _.map(todaysEntries, (entry) => entry.reason_label) || [];
      todayMostFreqMood = _.head(_(todaysMoodLabels).countBy().entries().maxBy(_.last));
      todayMostFreqReason = _.head(_(todaysReasonLabels).countBy().entries().maxBy(_.last));
    }
    else if (selectedLineChart === 'overall') {
      const groupedByDay = _.groupBy(dataType, (entry) =>
        dayjs(entry.created_at).format('YYYY-MM-DD')
      );

      overallAverages = _.map(groupedByDay, (moodScores) => _.meanBy(moodScores, 'mood_score'));
      overall = _.sortBy(_.keys(groupedByDay));
      overallMostFreqMood = _.head(
        _(groupedByDay).flatMap().countBy('mood_label').entries().maxBy(_.last)
      );
      overallMostFreqReason = _.head(
        _(groupedByDay).flatMap().countBy('reason_label').entries().maxBy(_.last)
      );  
    }
    else if(selectedLineChart === 'weekly'){
      const groupedByWeek = _.groupBy(dataType, (entry) =>
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
    else if(selectedLineChart === 'monthly'){
      const groupedByMonth = _.groupBy(dataType, (entry) =>
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
    else if(selectedLineChart === 'yearly'){
      const groupedByYear = _.groupBy(dataType, (entry) =>
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
    
    // scatter 1
	}

  $: if(studentMoodData.length > 0){
    let filteredStudents = new Map();
	  const consecutiveDaysMap = new Map();
    consistentLowMoods.set([]);

    recentStudent = _.last(studentMoodData)['name']; // info card

    // table of students w consistent low moods
		let maxConsecutiveDays = 0;

		filteredStudents = studentMoodData.reduce(
			(students, { student_id, mood_score, reason_label, created_at }) => {
				if (!created_at || mood_score >= 0) {
					return students;
				}
				const dateKey = new Date(created_at).toLocaleDateString();

				const studentData = students.get(student_id) || new Map();
				studentData.set(dateKey, {
					moodScores: [...(studentData.get(dateKey)?.moodScores || []), mood_score],
					reasonLabels: [...(studentData.get(dateKey)?.reasonLabels || []), reason_label]
				});
				return students.set(student_id, studentData);
			}, new Map()
		);

		for (const [studentId, studentEntry] of filteredStudents) {
			let consecutiveDays = 0;
			let previousDate = null;
			let currentStreakData = null;

			for (const [dateKey, moodData] of studentEntry) {
				const currentDate = dayjs(dateKey);

				if (previousDate === null || currentDate.diff(previousDate, 'day') === 1) {
					consecutiveDays++;
				} else {
					consecutiveDays = 1;
				}

				if (consecutiveDays >= 4) {
					const lastRecord = (consecutiveDaysMap.get(studentId) || []).slice(-1)[0];

					if ( lastRecord && lastRecord.endDate === currentDate.subtract(1, 'day').format('M/D/YYYY') ) {
						lastRecord.endDate = currentDate.format('M/D/YYYY');
						lastRecord.moodScores.push(...moodData.moodScores);
						lastRecord.reasonLabels.push(...moodData.reasonLabels);
					} else {
						maxConsecutiveDays = Math.max(maxConsecutiveDays, consecutiveDays);

						currentStreakData = {
							startDate: currentDate.subtract(consecutiveDays - 1, 'day').format('M/D/YYYY'),
							endDate: currentDate.format('M/D/YYYY'),
							moodScores: [],
							reasonLabels: []
						};

						for (let i = 0; i < consecutiveDays; i++) {
							const streakDate = currentDate.subtract(consecutiveDays - 1 - i, 'day').format('M/D/YYYY');
							const streakMoodData = studentEntry.get(streakDate);

							if (streakMoodData) {
								currentStreakData.moodScores.push(...streakMoodData.moodScores);
								currentStreakData.reasonLabels.push(...streakMoodData.reasonLabels);
							}
						}

						consecutiveDaysMap.set(
							studentId,
							(consecutiveDaysMap.get(studentId) || []).concat(currentStreakData)
						);
					}
				}
				previousDate = currentDate;
			}
		}

    consecutiveDaysMap.forEach((streakData, studentId) => {
      const studentStreaks = streakData.map((streak) => ({
        startDate: streak.startDate,
        endDate: streak.endDate,
        moodScores: streak.moodScores,
        reasonLabels: streak.reasonLabels,
      }));

      consistentLowMoods.update((moods) => [
        ...moods,
        { studentId, streaks: studentStreaks },
      ]);
    });

    const sampleStudent = studentMoodData[0];
    const features = ["course", "year_level", "college", "reason_score", "created_at"];

    filteredProperties = Object.keys(sampleStudent)
      .map(property => {
        return { name: property, value: property };
      }).filter(propertyWithIndex => features.includes(propertyWithIndex.name));

  }

  $: if ($focusTable) {
    if (tableRef) {
      window.scrollTo(0, tableRef.offsetTop);
      focusTable.set(false)
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

  function updateCurrent() {
    current = dayjs();
  }
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="bg-zinc-50 p-4 flex flex-col space-y-3 z-0">
  <!-- Info Cards -->
	<div class="flex justify-between">
    <CardInfo title="" icon="" bind:data={current} />
    <CardInfo title="Latest Student:" icon="ProfileCardOutline" bind:data={recentStudent} />
    
		{#if selectedLineChart === 'today'}
      <div transition:fly>
        <CardInfo title="Today's Top Mood:" icon="FaceLaughOutline" bind:data={todayMostFreqMood} />
      </div>
      <div transition:fly>
        <CardInfo title="Today's Top Reason:" icon="BrainOutline" bind:data={todayMostFreqReason} />
      </div>
		{:else if selectedLineChart === 'overall'}
      <div transition:fly>
        <CardInfo title="Dominant Mood (Overall):" icon="FaceLaughOutline" bind:data={overallMostFreqMood} />
      </div>
      <div transition:fly>
        <CardInfo title="Dominant Reason (Overall):" icon="BrainOutline" bind:data={overallMostFreqReason} />
      </div>
		{:else if selectedLineChart === 'weekly'}
      <div transition:fly>
        <CardInfo title="Dominant Mood (Weekly):" icon="FaceLaughOutline" bind:data={weeklyMostFreqMood} />
      </div>
      <div transition:fly>
        <CardInfo title="Dominant Reason (Weekly):" icon="BrainOutline" bind:data={weeklyMostFreqReason} />
      </div>
		{:else if selectedLineChart === 'monthly'}
      <div transition:fly>
        <CardInfo title="Dominant Mood (Monthly):" icon="FaceLaughOutline" bind:data={monthlyMostFreqMood} />
      </div>
      <div transition:fly>
        <CardInfo title="Dominant Reason (Monthly):" icon="BrainOutline" bind:data={monthlyMostFreqReason} />
      </div>
		{:else if selectedLineChart === 'yearly'}
      <div transition:fly>
        <CardInfo title="Dominant Mood (Yearly):" icon="FaceLaughOutline" bind:data={yearlyMostFreqMood} />
      </div>
      <div transition:fly>
        <CardInfo title="Dominant Reason (Yearly):" icon="BrainOutline" bind:data={yearlyMostFreqReason} />
      </div>
		{/if}
    <Button class="max-h-14 justify-center shadow-md flex-row items-center space-x-2" on:click={() => window.print()}>
      <PrintSolid tabindex="-1" class="text-white focus:outline-none" />
    </Button>
	</div>

	<div class="flex flex-col space-y-3">
		<div class="flex space-x-4">
      <!-- Horizontal Mood Bar Chart -->
			<div class="p-4 bg-white rounded-sm drop-shadow-md">
				<HorizontalMoodBarChart bind:xData={xDataMBC} bind:yData={yDataMBC} elementID='dashboardHMBC' />
			</div>

			<div class="flex w-full bg-white rounded-sm drop-shadow-md items-center justify-center p-4">
				<div class="flex flex-col space-y-7">
					<div class="flex justify-between">
            <!-- Buttons for Time Intervals -->
						<ButtonGroup>
							<Button color={lcBtnColors.today} on:click={() => toggleChart('today')}>Today</Button>
							<Button color={lcBtnColors.weekly} on:click={() => toggleChart('weekly')}>Weekly</Button>
							<Button color={lcBtnColors.monthly} on:click={() => toggleChart('monthly')}>Monthly</Button>
							<Button color={lcBtnColors.yearly} on:click={() => toggleChart('yearly')}>Yearly</Button>
              <Button color={lcBtnColors.overall} on:click={() => toggleChart('overall')}>Overall</Button>
						</ButtonGroup>

            <!-- Buttons for Data Type (Anon/Students) -->
						<ButtonGroup>
              <Button color={viewAnonData ? "dark" : "light"} on:click={() => viewAnonData = true}>Anonymous</Button>
							<Button color={!viewAnonData ? "dark" : "light"} on:click={() => viewAnonData = false}>Students</Button>
						</ButtonGroup>
					</div>

          <!-- Line Charts for each time intervals -->
					{#if selectedLineChart === 'today'}
						<TodayLineChart bind:xData={timestamps} bind:yData={todaysMoodScores} elementID='dashboardTLC' />
					{:else if selectedLineChart === 'overall'}
						<OverallLineChart bind:xData={overall} bind:yData={overallAverages} elementID='dashboardDLC' />
					{:else if selectedLineChart === 'weekly'}
						<WeeklyLineChart bind:xData={weekly} bind:yData={weeklyAverages} elementID='dashboardWLC' />
					{:else if selectedLineChart === 'monthly'}
						<MonthlyLineChart bind:xData={monthly} bind:yData={monthlyAverages} elementID='dashboardMLC' />
					{:else if selectedLineChart === 'yearly'}
						<YearlyLineChart bind:xData={yearly} bind:yData={yearlyAverages} elementID='dashboardYLC' />
					{/if}
				</div>
			</div>
		</div>
		
		<div class="flex space-x-4">
      <!-- Heatmap Chart -->
			<div class="bg-white flex items-center rounded-sm drop-shadow-md p-4">
				<HeatmapChart {heatmapData} elementID='dashboardHM' />
			</div>

      <!-- table for students w consistent low moods -->
			<div id="low-moods" bind:this={tableRef}  class="bg-white rounded-sm !p-5 drop-shadow-md w-full">
        <caption class="text-lg font-bold text-left w-max text-gray-900 bg-white dark:text-white dark:bg-gray-800 mb-6">
          Students with consistent low moods
          <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
            By default, blah blah blah
          </p>
        </caption>
        <Table divClass="text-left text-sm text-gray-500 border border-zinc-300 dark:text-gray-400 max-h-72 overflow-y-auto">
          <TableHead class="bg-zinc-100 border border-t border-zinc-300 top-0 sticky">
            <TableHeadCell>ID Number</TableHeadCell>
            <TableHeadCell>Time Period</TableHeadCell>
            <TableHeadCell class="text-center">Average Mood</TableHeadCell>
            <TableHeadCell class="text-center">Prevailing Reason</TableHeadCell>
          </TableHead>
          <TableBody tableBodyClass="divide-y bg-white">
            {#if $consistentLowMoods === undefined || $consistentLowMoods.length === 0}
              <TableBodyRow class="border border-zinc-300 z-10">
                <TableBodyCell>No data</TableBodyCell>
                <TableBodyCell>No data</TableBodyCell>
                <TableBodyCell>No data</TableBodyCell>
                <TableBodyCell>No data</TableBodyCell>
              </TableBodyRow>
            {:else}
            {#each $consistentLowMoods as student}
              {#each student.streaks as streak}
              <TableBodyRow class="z-10">
                <TableBodyCell>
                  <a class="hover:underline" href="/dashboard/student-chart?search={student.studentId}" rel="noopener noreferrer">
                    {student.studentId}
                  </a>
                </TableBodyCell>
                <TableBodyCell>{streak.startDate} - {streak.endDate}</TableBodyCell>
                <TableBodyCell class="text-center">
                  {moodLabels[Math.round(streak.moodScores.reduce((accum, elem) => accum + elem, 0) / streak.moodScores.length) + 4]}
                </TableBodyCell>
                <TableBodyCell class="text-center">
                  {streak.reasonLabels.reduce(
                    (accum, elem, i, arr) => (arr.filter(v => v === accum).length >= arr.filter(v => v === elem).length ? accum : elem)
                  )}
                </TableBodyCell>
              </TableBodyRow>
              {/each}
            {/each}
            {/if}
          </TableBody>
        </Table>
      </div>
		</div>

    <div class="flex space-x-4">
      <div class="p-4 bg-white rounded-sm drop-shadow-md">
        <!-- <div>
          {#if !controlState}
            <div id="scatter-controls" class="flex flex-col space-y-2 bg-slate-900 w-56 pl-4 pt-4 pr-4">
              <Label class="text-white">xAxis</Label><Select placeholder="" items={filteredProperties} bind:value={xAxisScatter} />
              <Label class="text-white">yAxis</Label><Select placeholder="" items={filteredProperties} bind:value={yAxisScatter} />
            </div>
          {/if}
          <div class="flex flex-col bg-slate-900 p-4 w-56">
            <Button class="focus:ring-0" color="red" on:click={() => controlState = !controlState}>{controlsText}</Button>
          </div>
        </div> -->
      </div>
    </div>
	</div>
</div>
