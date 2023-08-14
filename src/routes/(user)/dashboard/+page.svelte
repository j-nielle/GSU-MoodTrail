<script>
	// @ts-nocheck
	import _ from 'lodash';
  import { getContext } from 'svelte';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { 
    Card, 
    Button, 
    ButtonGroup, 
    Label,
    Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		TableSearch
  } from 'flowbite-svelte';
	import { ProfileCardOutline, FaceLaughOutline, BrainOutline } from 'flowbite-svelte-icons';
  import {
    TodayLineChart,
    DailyLineChart,
    WeeklyLineChart,
    MonthlyLineChart,
    YearlyLineChart,
    MoodBarChart,
    HeatmapChart
  } from '$lib/components/charts/index.js';
	import { focusTable, consistentLowMoods } from '$lib/stores/index.js';

	export let data;

	let studentMoodData = data.studentMood;
	let anonMoodData = data.anonMood;
  
	let xDataMBC, yDataMBC;
	let todayMostFreqMood = [], todayMostFreqReason = [];
	let dailyMostFreqMood = [], dailyMostFreqReason = [];
	let weeklyMostFreqMood = [], weeklyMostFreqReason = [];
	let monthlyMostFreqMood = [], monthlyMostFreqReason = [];
	let yearlyMostFreqMood = [], yearlyMostFreqReason = [];

	let daily = [], dailyAverages = [];
	let weekly = [], weeklyAverages = [];
	let monthly = [], monthlyAverages = [];
	let yearly = [], yearlyAverages = [];
	let timestamps = [], todaysMoodScores = [];

	let recentStudent;
	let heatmapData;
	let selectedLineChart = 'today';
  const moodLabels = ['Sad', 'Annoyed', 'Nervous', 'Bored', 'Neutral', 'Calm', 'Relaxed', 'Happy', 'Excited'];

  $: ({ supabase } = data);

	onMount(() => {
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
					table: 'AnonMood'
				}, (payload) => {
					anonMoodData = _.cloneDeep([...anonMoodData, payload.new]);
				}
			).subscribe((status) => console.log('inside dashboard page', status));

		return () => {
			dashboardChannel.unsubscribe();
		};
	});

	$: if(studentMoodData.length > 0){
    let filteredStudents = new Map();
	  const consecutiveDaysMap = new Map();
    consistentLowMoods.set([]);

    recentStudent = _.last(studentMoodData)['name'];

		const groupedData = _.groupBy(studentMoodData, (data) => {
			const date = new Date(data.created_at);
			return [date.getDay(), date.getHours()];
		});

		heatmapData = _.flatMap(groupedData, (data, key) => {
			const [day, hour] = key.split(',');
			return [[parseInt(hour), parseInt(day), data.length || '-']];
		});

		const moodCount = _.countBy(studentMoodData, 'mood_label') || [];
		xDataMBC = _.keys(moodCount);
		yDataMBC = _.values(moodCount);

    const consecutiveThreshold = 4;
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
			},
			new Map()
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

				if (consecutiveDays >= consecutiveThreshold) {
					const lastRecord = (consecutiveDaysMap.get(studentId) || []).slice(-1)[0];

					if (
						lastRecord &&
						lastRecord.endDate === currentDate.subtract(1, 'day').format('M/D/YYYY')
					) {
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
							const streakDate = currentDate
								.subtract(consecutiveDays - 1 - i, 'day')
								.format('M/D/YYYY');
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
	}

  $: if(selectedLineChart === 'today'){
    const todaysEntries = _.filter(
      studentMoodData, (entry) => dayjs(entry.created_at).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    ) || [];

    timestamps = _.map(todaysEntries, (entry) => dayjs(entry.created_at).format('HH:mm:ss')) || [];
    todaysMoodScores = _.map(todaysEntries, (entry) => entry.mood_score) || [];
    const todaysMoodLabels = _.map(todaysEntries, (entry) => entry.mood_label) || [];
    const todaysReasonLabels = _.map(todaysEntries, (entry) => entry.reason_label) || [];
    todayMostFreqMood = _.head(_(todaysMoodLabels).countBy().entries().maxBy(_.last));
    todayMostFreqReason = _.head(_(todaysReasonLabels).countBy().entries().maxBy(_.last));
  }

  function toggleChart(chart) {
		selectedLineChart = chart;

    if (selectedLineChart === 'daily') {
      console.log('daily')
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
    }else if(selectedLineChart === 'weekly'){
      console.log('weekly')
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
    }else if(selectedLineChart === 'monthly'){
      console.log('monthly')
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
    }else if(selectedLineChart === 'yearly'){
      console.log('yearly')
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
	}

	const getWeekNumberString = (date) => {
		const firstDayOfYear = dayjs(date).startOf('year').day(1);
		const weekDiff = date.diff(firstDayOfYear, 'week') + 1;
		return `Week ${weekDiff}`;
	};

  let tableRef;

  $: if ($focusTable) {
    if (tableRef) {
      window.scrollTo(0, tableRef.offsetTop);
    }
  }
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>
<!-- <Button on:click={scrollToTable} /> -->
<div class="bg-zinc-50 p-4 flex flex-col space-y-3">
	<div class="flex justify-end space-x-3 mt-0.5 outline outline-teal-500 outline-1">
		<Card class="max-h-8 w-fit justify-center drop-shadow-md flex-row items-center space-x-2">
			<!-- (SOON): once recentStudent gets clicked, user will be led to the individual student section/page -->
			<ProfileCardOutline tabindex="-1" class="text-slate-900" />
			<Label class="text-slate-900"
				>Recent Student: <span class="font-bold cursor-pointer">{recentStudent ?? 'N/A'}</span
				></Label
			>
		</Card>
		{#if selectedLineChart === 'today'}
			<Card class="max-h-8 w-fit justify-center drop-shadow-md flex-row items-center space-x-2">
				<FaceLaughOutline tabindex="-1" class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Mood: <span class="font-bold">{todayMostFreqMood ?? 'N/A'}</span></Label
				>
			</Card>
			<Card class="max-h-8 w-fit justify-center drop-shadow-md flex-row items-center space-x-2">
				<BrainOutline tabindex="-1" class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Reason: <span class="font-bold">{todayMostFreqReason ?? 'N/A'}</span
					></Label
				>
			</Card>
		{:else if selectedLineChart === 'daily'}
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<FaceLaughOutline tabindex="-1" class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Mood: <span class="font-bold">{dailyMostFreqMood ?? 'N/A'}</span></Label
				>
			</Card>
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<BrainOutline tabindex="-1" class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Reason: <span class="font-bold">{dailyMostFreqReason ?? 'N/A'}</span
					></Label
				>
			</Card>
		{:else if selectedLineChart === 'weekly'}
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<FaceLaughOutline tabindex="-1" class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Mood: <span class="font-bold">{weeklyMostFreqMood ?? 'N/A'}</span></Label
				>
			</Card>
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<BrainOutline tabindex="-1" class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Reason: <span class="font-bold">{weeklyMostFreqReason ?? 'N/A'}</span
					></Label
				>
			</Card>
		{:else if selectedLineChart === 'monthly'}
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<FaceLaughOutline tabindex="-1" class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Mood: <span class="font-bold">{monthlyMostFreqMood ?? 'N/A'}</span></Label
				>
			</Card>
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<BrainOutline tabindex="-1" class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Reason: <span class="font-bold">{monthlyMostFreqReason ?? 'N/A'}</span
					></Label
				>
			</Card>
		{:else if selectedLineChart === 'yearly'}
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<FaceLaughOutline tabindex="-1" class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Mood: <span class="font-bold">{yearlyMostFreqMood ?? 'N/A'}</span></Label
				>
			</Card>
			<Card class="max-h-8 justify-center drop-shadow-md flex-row items-center space-x-2">
				<BrainOutline tabindex="-1" class="text-slate-900" />
				<Label class="text-slate-900"
					>Most Frequent Reason: <span class="font-bold">{yearlyMostFreqReason ?? 'N/A'}</span
					></Label
				>
			</Card>
		{/if}
	</div>
	<div class="flex flex-col space-y-3">
		<!-- Bar Chart and Line Chart -->
		<div class="flex space-x-4">
			<div class="p-4 outline outline-blue-500 outline-1 bg-white rounded-sm drop-shadow-xl">
				<MoodBarChart bind:xData={xDataMBC} bind:yData={yDataMBC} elementID={'dashboardMBC'} />
			</div>
			<div class="flex outline w-full outline-purple-500 outline-1 bg-white rounded-sm drop-shadow-xl items-center justify-center">
				<div class="flex flex-col p-3">
					<div class="flex justify-between mb-4">
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
		<div class="flex space-x-4">
			<div class="bg-white flex items-center rounded-sm drop-shadow-xl p-4 outline outline-yellow-500 outline-1">
				<HeatmapChart {heatmapData} elementID={'dashboardHM'} />
			</div>
			<div id="low-moods" bind:this={tableRef}  class="bg-white rounded-sm outline outline-1 !p-5 shadow-xl w-full">
        <caption class="text-lg font-bold text-left w-max text-gray-900 bg-white dark:text-white dark:bg-gray-800 mb-6">
          Students with consistent low moods
          <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
            By default, blah blah blah
          </p>
        </caption>
        <Table divClass="text-left text-sm text-gray-500 border border-zinc-300 dark:text-gray-400 max-h-72 overflow-y-scroll">
          <TableHead class="bg-zinc-100 border border-t border-zinc-300 top-0 sticky z-[1000]">
            <TableHeadCell>ID Number</TableHeadCell>
            <TableHeadCell>Date Range</TableHeadCell>
            <TableHeadCell>Average Mood</TableHeadCell>
            <TableHeadCell>Most Common Reason</TableHeadCell>
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
                <TableBodyCell>{student.studentId}</TableBodyCell>
                <TableBodyCell>{streak.startDate} - {streak.endDate}</TableBodyCell>
                <TableBodyCell>{moodLabels[Math.round(streak.moodScores.reduce((a, b) => a + b, 0) / streak.moodScores.length) + 4]}</TableBodyCell>
                <TableBodyCell>{streak.reasonLabels.reduce((a, b, i, arr) => (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b))}</TableBodyCell>
              </TableBodyRow>
              {/each}
            {/each}
            {/if}
          </TableBody>
        </Table>
      </div>
		</div>
	</div>
</div>
