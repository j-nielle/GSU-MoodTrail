<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { ProfileCardOutline, FaceLaughOutline, BrainOutline } from 'flowbite-svelte-icons';
	import { onMount } from 'svelte';
	import {
		Card,
		Button,
		ButtonGroup,
		Spinner,
		//Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell, 
		Tooltip,
		Label
	} from 'flowbite-svelte';
	import { PrintSolid } from 'flowbite-svelte-icons';
	import {
		RadarChart,
		LineChart,
		HorizontalMoodBarChart,
		HeatmapChart,
		NegativeBarChart
	} from '$lib/components/charts/index.js';
	import { focusTable, consistentLowMoods } from '$lib/stores/index.js';
	import { CardInfo } from '$lib/components/elements/index.js';
	import { mood, reason } from '$lib/constants/index.js';

	export let data;

	let studentMoodData = data.studentMood;
	let anonMoodData = data.anonMood;
	let dataType = [];

	let todaysEntries = [];
	let xDataMBC, yDataMBC;
	let todayMostFreqMood = '', todayMostFreqReason = '';
	let overallMostFreqMood = '', overallMostFreqReason = '';
	let weeklyMostFreqMood = '', weeklyMostFreqReason = '';
	let monthlyMostFreqMood = '', monthlyMostFreqReason = '';
	let yearlyMostFreqMood = '', yearlyMostFreqReason = '';

	let overall = [], overallAverages = [];
	let weekly = [], weeklyAverages = [];
	let monthly = [], monthlyAverages = [];
	let yearly = [], yearlyAverages = [];
	let timestamps = [], todaysMoodScores = [];

	let recentStudent;
	let heatmapData;
	let selectedLineChart = 'today';
	let selectedBarChart = 'course';

	let current = dayjs().format('ddd MMM D, YYYY h:mm A');
	const interval = 1000;
	
	let tableRef;
	let viewAnonData = false;
	let lcBtnColors = {};
	let bcBtnColors = {};

	let moodRadarData, reasonRadarIndicator;

	let courseYData, yearLvlYData, reasonYData;
	let avgMoodByCourse, avgMoodByYearLvl, avgMoodByReason;

	$: ({ supabase } = data);

	onMount(() => {
		const timer = setInterval(updateCurrent, interval);

		const dashboardChannel = supabase.channel('dashboard')
			.on('postgres_changes',{
					event: 'INSERT',
					schema: 'public',
					table: 'StudentMoodEntries'
				},(payload) => {
					studentMoodData = _.cloneDeep([...studentMoodData, payload.new]);
					studentMoodData.sort((a, b) => {
						const dateA = new Date(a.created_at);
						const dateB = new Date(b.created_at);
						return dateA - dateB;
					});
				}
			)
			.on('postgres_changes',{
					event: 'INSERT',
					schema: 'public',
					table: 'AnonMood'
				},(payload) => {
					anonMoodData = _.cloneDeep([...anonMoodData, payload.new]);
				}
			).subscribe((status) => console.log('/dashboard', status));

		return () => {
			clearInterval(timer);
			dashboardChannel.unsubscribe();
		};
	});

	$: viewAnonData ? (dataType = anonMoodData) : (dataType = studentMoodData);

	$: if (dataType) {
		const groupedData = _.groupBy(dataType, (data) => {
			const date = new Date(data.created_at);
			return [date.getDay(), date.getHours()];
		});

		heatmapData = _.flatMap(groupedData, (data, key) => {
			const [day, hour] = key.split(',');
			return [[parseInt(hour), parseInt(day), data.length || '-']];
		});

		// horizontal mood bar chart
		const moodCount = {};

		dataType.forEach((item) => {
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

		const sortedMoodCount = Object.fromEntries(
			Object.entries(moodCount).sort(([, a], [, b]) => a - b)
		);

		xDataMBC = _.keys(sortedMoodCount);
		yDataMBC = _.values(sortedMoodCount);

		// line charts
		lcBtnColors = {
			today: selectedLineChart === 'today' ? 'blue' : 'light',
			overall: selectedLineChart === 'overall' ? 'blue' : 'light',
			weekly: selectedLineChart === 'weekly' ? 'blue' : 'light',
			monthly: selectedLineChart === 'monthly' ? 'blue' : 'light',
			yearly: selectedLineChart === 'yearly' ? 'blue' : 'light'
		};

		if (selectedLineChart === 'today') {
			todaysEntries = _.filter(dataType,
				(entry) => dayjs(entry.created_at).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
			);

			timestamps = _.map(todaysEntries, (entry) => dayjs(entry.created_at).format('HH:mm:ss'));
			todaysMoodScores = _.map(todaysEntries, (entry) => entry.mood_score);

			const todaysMoodLabels = todaysMoodScores.map(
				(score) => Object.keys(mood).find((key) => mood[key] === parseInt(score)) || '-'
			);
			const todaysReasonScores = _.map(todaysEntries, (entry) => entry.reason_score) || [];
			const todaysReasonLabels = todaysReasonScores.map(
				(score) => Object.keys(reason).find((key) => reason[key] == score) || '-'
			);

			todayMostFreqMood = _.head(_(todaysMoodLabels).countBy().entries().maxBy(_.last));
			todayMostFreqReason = _.head(_(todaysReasonLabels).countBy().entries().maxBy(_.last));
		} else if (selectedLineChart === 'overall') {
			const groupedByDay = _.groupBy(dataType, (entry) =>
				dayjs(entry.created_at).format('YYYY-MM-DD')
			); // group each mood entries by day

			overallAverages = Object.values(groupedByDay).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			});

			overall = _.sortBy(_.keys(groupedByDay)); // days

			// object that stores number of occurences (value) for each recorded mood_score (key)
			const mostFreqMood = Object.entries(groupedByDay)
				.flatMap(([_, entries]) => entries) // get the entries from groupedByWeek object into a single array
				.reduce((moodCounts, entry) => {
					const mood = entry.mood_score;
					moodCounts[mood] = (moodCounts[mood] || 0) + 1; // 0 if mood is not yet in moodCounts, else increment by 1
					return moodCounts;
				}, {});

			// object that stores number of occurences (value) for each recorded reason_score (key)
			const mostFreqReason = Object.entries(groupedByDay)
				.flatMap(([_, entries]) => entries)
				.reduce((reasonCounts, entry) => {
					const reason = entry.reason_score;
					reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
					return reasonCounts;
				}, {});

			// array of the most frequent mood_score [0] and its number of occurences [1]
			const moodValue = Object.entries(mostFreqMood)
				.sort((a, b) => b[1] - a[1])
				.shift();

			// array of the most frequent reason_score [0] and its number of occurences [1]
			const reasonValue = Object.entries(mostFreqReason)
				.sort((a, b) => b[1] - a[1])
				.shift();
			
			overallMostFreqMood = Object.keys(mood).find((key) => mood[key] == parseInt(moodValue[0]));
			overallMostFreqReason = Object.keys(reason).find((key) => reason[key] === parseInt(reasonValue[0]));
		} else if (selectedLineChart === 'weekly') {
			const groupedByWeek = _.groupBy(dataType, (entry) =>
				getWeekNumberString(dayjs(entry.created_at))
			);

			weeklyAverages = Object.values(groupedByWeek).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			});

			weekly = _.sortBy(_.keys(groupedByWeek));
			
			// object that stores number of occurences (value) for each recorded mood_score (key)
			const mostFreqMood = Object.entries(groupedByWeek)
				.flatMap(([_, entries]) => entries) // get the entries from groupedByWeek object into a single array
				.reduce((moodCounts, entry) => {
					const mood = entry.mood_score;
					moodCounts[mood] = (moodCounts[mood] || 0) + 1; // 0 if mood is not yet in moodCounts, else increment by 1
					return moodCounts;
				}, {});

			// object that stores number of occurences (value) for each recorded reason_score (key)
			const mostFreqReason = Object.entries(groupedByWeek)
				.flatMap(([_, entries]) => entries)
				.reduce((reasonCounts, entry) => {
					const reason = entry.reason_score;
					reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
					return reasonCounts;
				}, {});

			// array of the most frequent mood_score [0] and its number of occurences [1]
			const moodValue = Object.entries(mostFreqMood)
				.sort((a, b) => b[1] - a[1])
				.shift();

			// array of the most frequent reason_score [0] and its number of occurences [1]
			const reasonValue = Object.entries(mostFreqReason)
				.sort((a, b) => b[1] - a[1])
				.shift();

			weeklyMostFreqMood = Object.keys(mood).find((key) => mood[key] == parseInt(moodValue[0]));
			weeklyMostFreqReason = Object.keys(reason).find((key) => reason[key] == parseInt(reasonValue[0]));
		} else if (selectedLineChart === 'monthly') {
			const groupedByMonth = _.groupBy(dataType, (entry) =>
				dayjs(entry.created_at).format('YYYY-MM')
			);

			monthlyAverages = Object.values(groupedByMonth).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			});

			monthly = _.sortBy(_.keys(groupedByMonth));

			// object that stores number of occurences (value) for each recorded mood_score (key)
			const mostFreqMood = Object.entries(groupedByMonth)
				.flatMap(([_, entries]) => entries) // get the entries from groupedByWeek object into a single array
				.reduce((moodCounts, entry) => {
					const mood = entry.mood_score;
					moodCounts[mood] = (moodCounts[mood] || 0) + 1; // 0 if mood is not yet in moodCounts, else increment by 1
					return moodCounts;
				}, {});

			// object that stores number of occurences (value) for each recorded reason_score (key)
			const mostFreqReason = Object.entries(groupedByMonth)
				.flatMap(([_, entries]) => entries)
				.reduce((reasonCounts, entry) => {
					const reason = entry.reason_score;
					reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
					return reasonCounts;
				}, {});

			// array of the most frequent mood_score [0] and its number of occurences [1]
			const moodValue = Object.entries(mostFreqMood)
				.sort((a, b) => b[1] - a[1])
				.shift();

			// array of the most frequent reason_score [0] and its number of occurences [1]
			const reasonValue = Object.entries(mostFreqReason)
				.sort((a, b) => b[1] - a[1])
				.shift();

			monthlyMostFreqMood = Object.keys(mood).find((key) => mood[key] == parseInt(moodValue[0]));
			monthlyMostFreqReason = Object.keys(reason).find((key) => reason[key] == parseInt(reasonValue[0]));
		} else if (selectedLineChart === 'yearly') {
			const groupedByYear = _.groupBy(dataType, (entry) => dayjs(entry.created_at).format('YYYY'));

			yearlyAverages = Object.values(groupedByYear).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			});

			yearly = _.sortBy(_.keys(groupedByYear));

			// object that stores number of occurences (value) for each recorded mood_score (key)
			const mostFreqMood = Object.entries(groupedByYear)
				.flatMap(([_, entries]) => entries) // get the entries from groupedByWeek object into a single array
				.reduce((moodCounts, entry) => {
					const mood = entry.mood_score;
					moodCounts[mood] = (moodCounts[mood] || 0) + 1; // 0 if mood is not yet in moodCounts, else increment by 1
					return moodCounts;
				}, {});

			// object that stores number of occurences (value) for each recorded reason_score (key)
			const mostFreqReason = Object.entries(groupedByYear)
				.flatMap(([_, entries]) => entries)
				.reduce((reasonCounts, entry) => {
					const reason = entry.reason_score;
					reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
					return reasonCounts;
				}, {});

			// array of the most frequent mood_score [0] and its number of occurences [1]
			const moodValue = Object.entries(mostFreqMood)
				.sort((a, b) => b[1] - a[1])
				.shift();

			// array of the most frequent reason_score [0] and its number of occurences [1]
			const reasonValue = Object.entries(mostFreqReason)
				.sort((a, b) => b[1] - a[1])
				.shift();

			yearlyMostFreqMood = Object.keys(mood).find((key) => mood[key] == parseInt(moodValue[0]));
			yearlyMostFreqReason = Object.keys(reason).find((key) => reason[key] == parseInt(reasonValue[0]));
		}
	}

	$: {
		if (selectedBarChart === 'course') {
			const courseData = studentMoodData?.reduce((acc, entry) => {
				const existingCourse = acc.find((item) => item.course === entry.course);

				if (existingCourse) {
					existingCourse.mood_scores.push(entry.mood_score);
				} else {
					acc.push({ course: entry.course, mood_scores: [entry.mood_score] });
				}
				return acc;
			}, []);

			avgMoodByCourse = courseData?.map((course) => {
				const moodScores = course.mood_scores;

				if (moodScores.length > 0) {
					const totalMoodScore = moodScores.reduce((sum, score) => sum + parseInt(score), 0);
					const avgMoodScore = totalMoodScore / moodScores.length;

					if (avgMoodScore < 0) {
						return { value: avgMoodScore, label: { position: 'right' } };
					} else {
						return avgMoodScore;
					}
				} else {
					return null;
				}
			});

			courseYData = courseData?.map((course) => course.course);
		} else if (selectedBarChart === 'year_level') {
			const yearLevelData = studentMoodData?.reduce((acc, entry) => {
				const yearLevel = acc.find((item) => item.yearLevel === entry.year_level);

				if (yearLevel) {
					yearLevel.mood_scores.push(entry.mood_score);
				} else {
					acc.push({ yearLevel: entry.year_level, mood_scores: [entry.mood_score] });
				}

				return acc;
			}, []);

			avgMoodByYearLvl = yearLevelData?.map((yearLevel) => {
				const moodScores = yearLevel.mood_scores;

				if (moodScores.length > 0) {
					const totalMoodScore = moodScores.reduce((sum, score) => sum + parseInt(score), 0);
					const avgMoodScore = totalMoodScore / moodScores.length;

					if (avgMoodScore < 0) {
						return { value: avgMoodScore, label: { position: 'right' } };
					} else {
						return avgMoodScore;
					}
				} else {
					return null;
				}
			});

			yearLvlYData = yearLevelData?.map((yearLevel) => yearLevel.yearLevel.replace(' Level', ''));
		} else if (selectedBarChart === 'reason') {
			const reasonData = studentMoodData?.reduce((acc, entry) => {
				const { reason_score, mood_score } = entry;
				const existingReason = acc.find((item) => item.reason_score === reason_score);

				if (existingReason) {
					existingReason.mood_scores.push(mood_score);
				} else {
					const reason_label = Object.keys(reason).find((key) => reason[key] === reason_score);
					acc.push({ reason_label, reason_score, mood_scores: [mood_score] });
				}
				return acc;
			}, []);

			avgMoodByReason = reasonData?.map((reason) => {
				const moodScores = reason.mood_scores;

				if (moodScores.length > 0) {
					const totalMoodScore = moodScores.reduce((sum, score) => sum + parseInt(score), 0);
					const avgMoodScore = totalMoodScore / moodScores.length;

					if (avgMoodScore < 0) {
						return { value: avgMoodScore, label: { position: 'right' } };
					} else {
						return avgMoodScore;
					}
				} else {
					return null;
				}
			});

			reasonYData = reasonData?.map((reason) => reason.reason_label);
		}

		bcBtnColors = {
			course: selectedBarChart === 'course' ? 'dark' : 'light',
			year_level: selectedBarChart === 'year_level' ? 'dark' : 'light',
			reason: selectedBarChart === 'reason' ? 'dark' : 'light'
		};
	}

	$: if (studentMoodData) {
		recentStudent = studentMoodData?.slice(-1)[0]?.name; // info card

		// table of students w consistent low moods
		let filteredStudents = new Map();
		let consecutiveDaysMap = new Map();
		consistentLowMoods.set([]);
		let maxConsecutiveDays = 0; // to keep track of the maximum number of consecutive low mood days encountered

		filteredStudents = studentMoodData?.reduce(
			(students, { student_id, mood_score, created_at, reason_score }) => {
				if (!created_at || mood_score >= 0) { // if created_at is null or mood_score is not negative,
					return students; // skip this entry
				}
				
				const dateKey = new Date(created_at).toLocaleDateString('en-US', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit'
				}); // MM/DD/YYYY
				
				const studentData = students.get(student_id) || new Map(); // get the student's data or create a new one

				// get the reason label from the reason score using reason object
				const reason_label = Object.keys(reason).find((key) => reason[key] === reason_score);

				// add the moods and reasons to the student's data based on the corresponding date
				studentData.set(dateKey, {
					moodScores: [...(studentData.get(dateKey)?.moodScores || []), mood_score],
					reasonLabels: [...(studentData.get(dateKey)?.reasonLabels || []), reason_label]
				});

				return students.set(student_id, studentData); // update the student's data
			}, new Map()
		);

		for (const [studentId, studentEntry] of filteredStudents) {
			let consecutiveDays = 0;
			let previousDate = null;
			let currentStreakData = null;

			// for each date of mood data for a student, calculate the consecutive low mood days
			for (const [dateKey, moodData] of studentEntry) {
				const currentDate = dayjs(dateKey);

				// if the current date is the next day of the previous date, increment the consecutive days
				if (previousDate === null || currentDate.diff(previousDate, 'day') === 1) {
					consecutiveDays++;
				} else { // else, reset the consecutive days to 1
					consecutiveDays = 1;
				}

				// if the consecutive days is >= to 4, check if the previous date is the day before the current date
				if (consecutiveDays >= 4) {
					const lastRecord = (consecutiveDaysMap?.get(studentId) || []).slice(-1)[0]; // get the last record of the student's streaks

					// if the last record's end date is the day before the current date, update the last record
					if (lastRecord && lastRecord.endDate === currentDate.subtract(1, 'day').format('MM/DD/YYYY')) {
						lastRecord.endDate = currentDate.format('MM/DD/YYYY'); // update the end date
						lastRecord.moodScores.push(...moodData.moodScores); // add the mood scores 
						lastRecord.reasonLabels.push(...moodData.reasonLabels); // and reason labels
					} else { // else, create a new record
						maxConsecutiveDays = Math.max(maxConsecutiveDays, consecutiveDays); // update the maximum consecutive days

						// create a new record with the start date, end date, mood scores, and reason labels
						currentStreakData = {
							startDate: currentDate.subtract(consecutiveDays - 1, 'day').format('MM/DD/YYYY'),
							endDate: currentDate.format('MM/DD/YYYY'),
							moodScores: [],
							reasonLabels: []
						};

						// loop through the consecutive days and get the mood scores and reason labels
						for (let i = 0; i < consecutiveDays; i++) {
							// get the date of the streak
							const streakDate = currentDate.subtract(consecutiveDays - 1 - i, 'day').format('MM/DD/YYYY');

							// get the mood scores and reason labels of the streak date
							const streakMoodData = studentEntry.get(streakDate);

							// if there is mood data for the streak date, add the mood scores and reason labels to the current streak data
							if (streakMoodData) {
								currentStreakData.moodScores.push(...streakMoodData.moodScores);
								currentStreakData.reasonLabels.push(...streakMoodData.reasonLabels);
							}
						}

						// add the current streak data to the consecutive days map
						consecutiveDaysMap?.set(
							studentId,
							(consecutiveDaysMap?.get(studentId) || []).concat(currentStreakData)
						);
					}
				}
				previousDate = currentDate; // update the previous date
			}
		}

		// update the consistent low moods store when the consecutive days map is updated
		consecutiveDaysMap?.forEach((streakData, studentId) => {
			const studentStreaks = streakData?.map((streak) => ({
				startDate: streak.startDate,
				endDate: streak.endDate,
				moodScores: streak.moodScores,
				reasonLabels: streak.reasonLabels
			}));

			consistentLowMoods?.update((moods) => [...moods, { studentId, streaks: studentStreaks }]);
		});

		// for radar chart
		const moodData = {};

		for (const student of studentMoodData) {
			// Find the mood label corresponding to the student's mood score
			const moodLabel = Object.keys(mood).find((key) => mood[key] == student.mood_score);
			
			if (moodLabel) { // if mood is found
				// initialize the moodData with the mood label (key) and an array of 0s (value)
				moodData[moodLabel] = Array(Object.keys(reason).length).fill(0); 
			}
		}

		// Loop through the student mood data and update the mood data object based on the mood and reason scores
		for (const student of studentMoodData) {
			const moodLabel = Object.keys(mood).find((key) => mood[key] == student.mood_score);

			// Calculate the index for the reason score (subtracting 1 to match array indices)
			const reasonIndex = student.reason_score - 1;

			// If a mood label exists and the reason index is valid (non-negative)
			// increment the corresponding moodData entry
			if (moodLabel && reasonIndex >= 0) {
				moodData[moodLabel][reasonIndex]++;
			}
		}

		// Prepare data in a format suitable for a radar chart
		moodRadarData = Object.keys(moodData).map((moodLabel) => ({

			// Map mood data to an array of values, representing number of occurences for each reason under each mood
			value: Object.keys(reason).map((reasonLabel) => moodData[moodLabel][reason[reasonLabel] - 1]),
			name: moodLabel
		}));

		const maxValues = Object.keys(reason).map((reasonLabel) =>
			Math.max(...moodRadarData?.map((mood) => mood.value[reason[reasonLabel] - 1]))
		);

		reasonRadarIndicator = Object.keys(reason).map((reasonLabel, reasonIndex) => ({
			name: reasonLabel,
			max: maxValues[reasonIndex] + 3
		}));
	}

	$: if ($focusTable) {
		if (tableRef) {
			window.scrollTo(0, tableRef.offsetTop);
			focusTable.set(false);
		}
	}

	function selectLineChart(lineChart) {
		selectedLineChart = lineChart;
	}

	function selectBarChart(barChart) {
		selectedBarChart = barChart;
	}

	const getWeekNumberString = (date) => {
		const firstDayOfYear = dayjs(date).startOf('year').day(1);
		const weekDiff = date.diff(firstDayOfYear, 'week') + 1;
		return `Week ${weekDiff}`;
	};

	function updateCurrent() {
		current = dayjs().format('MMM D, YYYY hh:mm:ss A');
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="bg-zinc-50 p-4 flex flex-col space-y-3 z-10">
	<!-- <div class="flex justify-between">
		<CardInfo purpose="time" title="" bind:data={current} />
		<CardInfo purpose="recentStudent" title="Latest Student:" bind:data={recentStudent} />

		{#if selectedLineChart === 'today'}
			<div>
				<CardInfo purpose="mood" title="Today's Mood:" bind:data={todayMostFreqMood} />
			</div>
			<div>
				<CardInfo purpose="reason" title="Today's Reason:" bind:data={todayMostFreqReason} />
			</div>
		{:else if selectedLineChart === 'overall'}
			<div>
				<CardInfo purpose="mood"
					title="Mood (Overall):"
					bind:data={overallMostFreqMood}
				/>
			</div>
			<div>
				<CardInfo purpose="reason"
					title="Reason (Overall):"
					bind:data={overallMostFreqReason}
				/>
			</div>
		{:else if selectedLineChart === 'weekly'}
			<div>
				<CardInfo purpose="mood"
					title="Mood (Weekly):"
					bind:data={weeklyMostFreqMood}
				/>
			</div>
			<div>
				<CardInfo purpose="reason"
					title="Reason (Weekly):"
					bind:data={weeklyMostFreqReason}
				/>
			</div>
		{:else if selectedLineChart === 'monthly'}
			<div>
				<CardInfo purpose="mood"
					title="Mood (Monthly):"
					bind:data={monthlyMostFreqMood}
				/>
			</div>
			<div>
				<CardInfo purpose="reason"
					title="Reason (Monthly):"
					bind:data={monthlyMostFreqReason}
				/>
			</div>
		{:else if selectedLineChart === 'yearly'}
			<div>
				<CardInfo purpose="mood"
					title="Mood (Yearly):"
					bind:data={yearlyMostFreqMood}
				/>
			</div>
			<div>
				<CardInfo purpose="reason"
					title="Reason (Yearly):"
					bind:data={yearlyMostFreqReason}
				/>
			</div>
		{/if}
		<Button	class="max-h-14 justify-center shadow-md flex-row items-center space-x-2"
			on:click={() => window.print()}>
			<PrintSolid tabindex="-1" class="text-white focus:outline-none" />
		</Button>
	</div> -->

	<div class="flex flex-col space-y-3">
		<div class="flex space-x-4">
			<!-- <div class="p-4 bg-white rounded-sm drop-shadow-md hover:ring-1">
				{#if dataType.length == 0}
					<div class="flex justify-center items-center" style="width:390px; height:350px;">
						<Spinner class="w-28 h-28" />
					</div>
				{:else}
					<HorizontalMoodBarChart
						bind:xData={xDataMBC}
						bind:yData={yDataMBC}
						elementID="dashboardHMBC"
					/>
				{/if}
			</div> -->

			<div class="flex w-full bg-white rounded-sm drop-shadow-md items-center justify-center p-4 hover:ring-1">
				<div class="flex flex-col space-y-7">
						<div class="flex justify-between">
							<ButtonGroup>
								<Button disabled={dataType.length == 0} color={lcBtnColors.today} on:click={() => selectLineChart('today')}>
									Today
								</Button>
								<Button disabled={dataType.length == 0} color={lcBtnColors.weekly} on:click={() => selectLineChart('weekly')}>
									Weekly
								</Button>
								<Button disabled={dataType.length == 0} color={lcBtnColors.monthly} on:click={() => selectLineChart('monthly')}>
									Monthly
								</Button>
								<Button disabled={dataType.length == 0} color={lcBtnColors.yearly} on:click={() => selectLineChart('yearly')}>
									Yearly
								</Button>
								<Button disabled={dataType.length == 0} color={lcBtnColors.overall} on:click={() => selectLineChart('overall')}>
									Overall
								</Button>
							</ButtonGroup>

							<ButtonGroup>
								<Button disabled={anonMoodData.length == 0} color={viewAnonData ? 'dark' : 'light'} on:click={() => (viewAnonData = true)}>
									Anonymous
								</Button>
								<Button disabled={studentMoodData.length == 0} color={!viewAnonData ? 'dark' : 'light'} on:click={() => (viewAnonData = false)}>
									Students
								</Button>
							</ButtonGroup>
						</div>
			<!--  {#if dataType.length > 0}
							{#if selectedLineChart === 'today'}
								<LineChart
									bind:xData={timestamps}
									bind:yData={todaysMoodScores}
									elementID="dashboardTLC"
									title="Today's Moods"
									style="width:790px; height:280px;"
								/>
							{:else if selectedLineChart === 'overall'}
								<LineChart
									bind:xData={overall}
									bind:yData={overallAverages}
									elementID="dashboardDLC"
									title="Average Mood Overall"
									style="width:790px; height:280px;"
								/>
							{:else if selectedLineChart === 'weekly'}
								<LineChart
									bind:xData={weekly}
									bind:yData={weeklyAverages}
									elementID="dashboardWLC"
									title="Average Mood Weekly"
									style="width:790px; height:280px;"
								/>
							{:else if selectedLineChart === 'monthly'}
								<LineChart
									bind:xData={monthly}
									bind:yData={monthlyAverages}
									elementID="dashboardMLC"
									title="Average Mood Monthly"
									style="width:790px; height:280px;"
								/>
							{:else if selectedLineChart === 'yearly'}
							<LineChart
								bind:xData={yearly}
								bind:yData={yearlyAverages}
								elementID="dashboardYLC"
								title="Average Mood Yearly"
								style="width:790px; height:280px;"
							/>
						{/if}
					{:else}
						<div class="flex justify-center items-center" style="width:790px; height:280px;">
							<Spinner class="w-28 h-28" />
						</div>
					{/if} -->
				</div>
			</div>
		</div>

		<div class="flex space-x-4">
			<div class="bg-white flex items-center rounded-sm drop-shadow-md p-4 hover:ring-1">
				{#if dataType.length > 0}
					<HeatmapChart
						title="Mood Frequency by Day and Hour"
						{heatmapData}
						elementID="dashboardHM"
						style="width:580px; height:350px;"
					/>
				{:else}
					<div class="flex justify-center items-center" style="width:620px; height:350px;">
						<Spinner class="w-28 h-28" />
					</div>
				{/if}
			</div>

			<!-- <div id="low-moods" bind:this={tableRef} class="bg-white rounded-sm !p-5 drop-shadow-md w-full hover:ring-1">
				<caption class="text-lg font-bold text-left w-max text-gray-900 bg-white dark:text-white dark:bg-gray-800 mb-6">
					Table of Students with Consistent Low moods
					<p class="mt-2 text-sm font-normal text-gray-500 dark:text-gray-400">
						These students have experienced consistent low moods for atleast 4 consecutive days.
					</p>
					<p class="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">
						*No common reason found.
					</p>
				</caption>
				<Table divClass="text-left text-sm text-gray-500 border border-zinc-300 dark:text-gray-400 max-h-72 overflow-y-auto">
					<TableHead class="bg-zinc-100 border border-t border-zinc-300 top-0 sticky text-center">
						<TableHeadCell>ID Number</TableHeadCell>
						<TableHeadCell>Time Period</TableHeadCell>
						<TableHeadCell class="text-center">Average Mood</TableHeadCell>
						<TableHeadCell class="text-center">Prevailing Reason</TableHeadCell>
					</TableHead>
					<TableBody tableBodyClass="divide-y bg-white">
						{#if $consistentLowMoods === undefined || $consistentLowMoods.length === 0}
							<TableBodyRow class="border border-zinc-300 z-10 text-center">
								<TableBodyCell>No data</TableBodyCell>
								<TableBodyCell>No data</TableBodyCell>
								<TableBodyCell>No data</TableBodyCell>
								<TableBodyCell>No data</TableBodyCell>
							</TableBodyRow>
						{:else}
							{#each $consistentLowMoods as student}
								{#each student.streaks as streak}
									<TableBodyRow class="z-10">
										<TableBodyCell class="text-center">
											<a class="hover:underline" href="/students/student-chart?search={student.studentId}" rel="noopener noreferrer">
												{student.studentId}
											</a>
										</TableBodyCell>
										<TableBodyCell class="text-center">
											{streak.startDate} - {streak.endDate}
										</TableBodyCell>
										<TableBodyCell class="text-center">
											{
												Object.keys(mood).find(
													(key) => mood[key] === Math.round(
														streak.moodScores.reduce((accum, elem) => accum + parseInt(elem), 0) / streak.moodScores.length)
												)
											}
										</TableBodyCell>
										<TableBodyCell class="text-center">
											{(() => { // Immediately Invoked Function Expression
												const labelCounts = {};

												// Iterate through each reason label in the streak
												streak.reasonLabels.forEach((reasonLabel) => {
													// Increment the count for the current reason label in labelCounts
      										// If it doesn't exist in labelCounts yet, initialize it to 0 first
													labelCounts[reasonLabel] = (labelCounts[reasonLabel] || 0) + 1;
												});
												
												// Get the reason label with the highest count
												const mostFrequentReason = Object.keys(labelCounts).reduce(
													(a, b) => (labelCounts[a] > labelCounts[b] ? a : b),
													null
												);

												// If there is a most frequent reason and it occurs more than once, return it
												if (mostFrequentReason && labelCounts[mostFrequentReason] > 1) {
													return mostFrequentReason;
												} else {
													return "Multiple Reasons*";
												}
											})()}
										</TableBodyCell>
									</TableBodyRow>
								{/each}
							{/each}
						{/if}
					</TableBody>
				</Table>
			</div> -->
		</div>

		<div class="flex space-x-4">
			<div class="p-4 bg-white rounded-sm drop-shadow-md flex justify-center hover:ring-1">
				<div class="flex flex-col">
					{#if moodRadarData.length > 0}
						<p class="text-lg font-bold self-center mb-3">Mood and Frequency of Related Reasons</p>
						<RadarChart
							bind:data={moodRadarData}
							bind:indicator={reasonRadarIndicator}
							elementID="testRadar"
							style="width:616px; height:450px;"
						/>
					{:else}
						<div class="flex justify-center items-center" style="width:616px; height:450px;">
							<Spinner class="w-28 h-28" />
						</div>
					{/if}
				</div>
			</div>
			<div class="p-4 bg-white rounded-sm drop-shadow-md flex justify-center hover:ring-1">
				<div class="flex flex-col">
					{#if avgMoodByCourse.length > 0}
						<div class="flex justify-between">
							<div class="flex flex-col">
								<p class="text-lg font-bold ml-1">Mood Averages</p>
								<p class="ml-1 font-light text-sm">(including the negatives)</p>
							</div>
							<ButtonGroup class="mb-3">
								<Button color={bcBtnColors.course} on:click={() => selectBarChart('course')}>
									By Course
								</Button>
								<Button color={bcBtnColors.year_level} on:click={() => selectBarChart('year_level')}>
									By Year Level
								</Button>
								<Button color={bcBtnColors.reason} on:click={() => selectBarChart('reason')}>
									By Reason
								</Button>
							</ButtonGroup>
						</div>
						<div class="mt-3 items-center">
							{#if selectedBarChart === 'course'}
								<NegativeBarChart
									bind:xData={avgMoodByCourse}
									bind:yData={courseYData}
									elementID="courseBarChart-1"
									style="width:615px; height:410px;"
								/>
							{:else if selectedBarChart === 'year_level'}
								<NegativeBarChart
									bind:xData={avgMoodByYearLvl}
									bind:yData={yearLvlYData}
									elementID="yrLvlBarChart-1"
									style="width:615px; height:410px;"
								/>
							{:else if selectedBarChart === 'reason'}
								<NegativeBarChart
									bind:xData={avgMoodByReason}
									bind:yData={reasonYData}
									elementID="reasonBarChart-1"
									style="width:615px; height:410px;"
								/>
							{/if}	
						</div>
					{:else}
						<div class="flex justify-center items-center" style="width:615px; height:410px;">
							<Spinner class="w-28 h-28" />
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
