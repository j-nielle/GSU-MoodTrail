<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import {
		//Card,
		Button,
		ButtonGroup,
		Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Tooltip, 
		Modal, 
		Checkbox
	} from 'flowbite-svelte';
	import {
		RocketOutline, 
		ForwardSolid, 
		ArrowLeftToBracketOutline,
		ChartMixedOutline,
		ChartOutline,
		TableColumnOutline,
		CalendarMonthOutline,
	} from 'flowbite-svelte-icons';
	import {
		RadarChart,
		LineChart,
		HorizontalMoodBarChart,
		HeatmapChart,
		NegativeBarChart,
		Histogram,
		SimpleBarChart,
		CalendarChart,
	} from '$lib/components/charts/index.js';
	import { focusTable, consistentLowMoods } from '$lib/stores/index.js';
	import { CardInfo } from '$lib/components/elements/index.js';
	import { 
		mood, 
		reason, 
		yearLvl, 
		daysShort, 
		moodChoices, 
		reasonChoices, 
		getWeekNumberString, 
		requestTypes 
	} from '$lib/constants/index.js';

	export let data;

	let studentMoodData = data.studentMood;
	let anonMoodData = data.anonMood;
	let requestsData = data.requests;
	let dataType = {};

	let todaysEntries = [];
	let xDataMBC, yDataMBC;
	let heatmapData;

	let recentStudent;
	let todayMostFreqMood = '',
		todayMostFreqReason = '';
	let overallMostFreqMood = '',
		overallMostFreqReason = '';
	let weeklyMostFreqMood = '',
		weeklyMostFreqReason = '';
	let monthlyMostFreqMood = '',
		monthlyMostFreqReason = '';
	let yearlyMostFreqMood = '',
		yearlyMostFreqReason = '';

	let overall = [],
		overallAverages = [];
	let weekly = [],
		weeklyAverages = [];
	let monthly = [],
		monthlyAverages = [];
	let yearly = [],
		yearlyAverages = [];
	let timestamps = [],
		todaysMoodScores = [];

	let selectedLineChart = 'today',
		lineChartTitle = '';
	let selectedNHBarChart = 'course';

	let current = dayjs();
	const interval = 1000;

	let viewAnonData = false;

	let lcBtnColors = {};
	let nhbcBtnColors = {};
	let sbcBtnColors = {};

	const tableDivClass = "text-left mx-3 text-sm text-gray-500 border border-zinc-300 dark:text-gray-400 max-h-56 overflow-y-auto"

	const toggleBtnClass = {
		inactive:
			'text-center font-medium inline-flex items-center justify-center px-3 py-2 text-xs text-white rounded-full',
		active:
			'text-center font-medium focus:outline-none inline-flex items-center justify-center px-3 py-2 text-xs text-white bg-primary-700 hover:bg-primary-800 dark:bg-primary-600 dark:hover:bg-primary-700 focus:ring-primary-300 dark:focus:ring-primary-800 rounded-full'
	};

	let moodRadarData = {},
		reasonRadarIndicator = {};

	let courseYData = [],
		yearLvlYData = [],
		reasonYData = [];
	let avgMoodByCourse = {},
		avgMoodByYearLvl = {},
		avgMoodByReason = {};

	let xDataSBC = [],
		yDataSBC = [];

	let selectedReasonMarkType = 'average', sbcMarkType = '';
	let selectedReasonCalendar = '', selectedMoodCalendar = '';

	let jumpToModalState = false;
	let tableRef;

	let selectedMoodScore;
	let xMoodWeek = [], yMoodWeekEntry = [];
	let yReasonPercentage = [], xReason = [];

	let lowMoodsOnly = false;

	let mostFrequentRequestType = '';

	$: ({ supabase } = data);

	onMount(() => {
		const timer = setInterval(updateTime, interval);

		const dashboardChannel = supabase.channel('dashboard')
			.on('postgres_changes', {
					event: '*',
					schema: 'public',
					table: 'StudentMoodEntries'
				},(payload) => {
					if (payload.eventType === 'INSERT') {
						studentMoodData = _.cloneDeep([...studentMoodData, payload.new]);
						studentMoodData.sort((currentElem, nextElem) => { // sort by date (asc)
							const currentDate = new Date(currentElem.created_at);
							const nextDate = new Date(nextElem.created_at);
							return currentDate - nextDate;
						});
					} else if (payload.eventType === 'UPDATE') {
						const updatedIndex = studentMoodData.findIndex((student) => student.id === payload.old.id);

						if (updatedIndex !== -1) {
							studentMoodData[updatedIndex] = payload.new;
						}

						studentMoodData = _.cloneDeep(studentMoodData);
					} else if (payload.eventType === 'DELETE') {
						const updatedStudentMoodData = studentMoodData.filter(
							(student) => student.id !== payload.old.id
						);
						studentMoodData = updatedStudentMoodData;
					}
				}
			).on('postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'AnonMood'
				}, (payload) => {
					anonMoodData = _.cloneDeep([...anonMoodData, payload.new]);
				}
			).subscribe() // (status) => console.log('/dashboard', status));

		return () => {
			clearInterval(timer);
			dashboardChannel.unsubscribe();
		};
	});

	$: viewAnonData ? (dataType = anonMoodData) : (dataType = studentMoodData);

	// note: while this is reactive, it's not realtime. it only updates when the page is refreshed.
	// because the data is only fetched once, and not subscribed to.
	$: if(requestsData){
		let getRequests = requestsData?.map(req => requestTypes[req.request_type]);
		let uniqueRequestTypes = [...new Set(getRequests)];
		let highestCount = 0;

		uniqueRequestTypes?.forEach(requestType => {
			// this is the number of times the current request type appears in the array
			let count = getRequests?.filter(type => type === requestType).length;
			// if the current request type appears more times than the previous highest count,
			if (count > highestCount) {
				highestCount = count; // set the current count as the new highest count
				mostFrequentRequestType = requestType; // set the current request type as the most frequent
			}
		});
		
		// if there are no requests, 
		if (uniqueRequestTypes?.length === 0) {
			// set mostFrequentRequestType to 'No requests'
			mostFrequentRequestType = "No requests";
		}
		// if there is only one request type, 
		else if (uniqueRequestTypes?.length === 1) {
			// set mostFrequentRequestType to that request type
			mostFrequentRequestType = uniqueRequestTypes[0];
		}
		// if there are multiple request types with the same highest count,
		else if (highestCount === uniqueRequestTypes?.length) {
			// set mostFrequentRequestType to 'Equal counts for all types'
			mostFrequentRequestType = "Equal counts for all types";
		}
	}

	$: if (dataType) {
		// FOR HEATMAP CHART - MOOD FREQUENCY BY DAY AND HOUR

		// apply lowMoodsOnly filter if true
		// which is basically filtering out mood scores from -4 to -1
		let filteredDataType = lowMoodsOnly ? 
			dataType?.filter(data => data.mood_score >= -4 && data.mood_score <= -1) : dataType;
		
		// e.g { '0,1': [ { id: ... }, { id: ... } ], '3,14': [ { id: ... } ] }
		const groupedData = _.groupBy(filteredDataType, (data) => {
			const date = new Date(data.created_at);

			// getDay() returns 0 for Sunday, 1 for Monday, etc. (0-6)
			// getHours() returns the hour (0-23)
			return [date.getDay(), date.getHours()];
		});

		// e.g [ [ 14, 2, 4 ], [ ... ] ] -> [ [ hour, weekday, mood occurences ] ]
		heatmapData = _.flatMap(groupedData, (data, key) => {
			// data = [ { id: ... } ], key = '0,1'
			const [day, hour] = key.split(',');
			return [[parseInt(hour), parseInt(day), data.length || '-']];
		});

		// FOR HORIZONTAL MOOD BAR CHART - MOOD FREQUENCY
		const moodCount = {}; // object to store the count of each mood

		dataType.forEach((item) => {
			const moodScore = item.mood_score; // get mood_score from the current item
			let moodLabel = null;

			// iterate over each key in the mood object
			for (const key in mood) {
				// if the current key's value matches the moodScore, 
				// make key the value of moodLabel and break the loop
				if (mood[key] == moodScore) {
					moodLabel = key;
					break;
				}
			}

			// if moodLabel was found, increment its count in moodCount object
			// (or initialize to 1 if not present)
			if (moodLabel) {
				moodCount[moodLabel] = (moodCount[moodLabel] || 0) + 1;
			}
		});

		// make a new object from moodCount, 
		// but with entries sorted by their values a.k.a counts
		const sortedMoodCount = Object.fromEntries(
			Object.entries(moodCount).sort(([, curr], [, next]) => curr - next)
		);

		xDataMBC = _.keys(sortedMoodCount);
		yDataMBC = _.values(sortedMoodCount);

		// FOR SIMPLE BAR CHART - ASSOCIATED REASON FREQUENCY
		const reasonCount = {}; // object to store the count of each reason

		// iterate over each item in the dataType array
		dataType.forEach((item) => {
			const reasonScore = item.reason_score; // get reason_score from the current item
			let reasonLabel = null; // initialize reasonLabel to null

			for (const key in reason) { // iterate over each key in the reason object
				if (reason[key] == reasonScore) { // if the current key's value matches the reasonScore,
					reasonLabel = key; // make key the value of reasonLabel and break the loop
					break;
				}
			}

			if (reasonLabel) { // if reasonLabel was found, increment its count in reasonCount object
				reasonCount[reasonLabel] = (reasonCount[reasonLabel] || 0) + 1; // (or initialize to 1 if not present)
			}
		});

		// make a new object from reasonCount,
		// but with entries sorted by their values a.k.a counts
		const sortedReasonCount = Object.fromEntries(
			Object.entries(reasonCount).sort(([, curr], [, next]) => curr - next)
		);

		xDataSBC = _.keys(sortedReasonCount);
		yDataSBC = _.values(sortedReasonCount);

		// FOR LINE CHARTS
		if (selectedLineChart === 'today') {
			lineChartTitle = "Today's Moods";

			// filter the dataType array to only include entries from today
			todaysEntries = _.filter(
				dataType,
				(entry) => dayjs(entry.created_at).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
			);

			// map the timestamps of today's entries to an array
			timestamps = _.map(todaysEntries, (entry) => dayjs(entry.created_at).format('HH:mm:ss')); // x
			todaysMoodScores = _.map(todaysEntries, (entry) => entry.mood_score); // y

			// map the mood scores of today's entries to an array of mood labels
			const todaysMoodLabels = todaysMoodScores.map(
				(score) => Object.keys(mood).find((key) => mood[key] === parseInt(score)) || '-'
			);

			// map the reason scores of today's entries
			const todaysReasonScores = _.map(todaysEntries, (entry) => entry.reason_score) || [];

			// map the reason scores of today's entries to an array of reason labels
			const todaysReasonLabels = todaysReasonScores.map(
				(score) => Object.keys(reason).find((key) => reason[key] == score) || '-'
			);

			// get the most frequent mood and reason label of today's entries
			todayMostFreqMood = _.head(_(todaysMoodLabels).countBy().entries().maxBy(_.last));
			todayMostFreqReason = _.head(_(todaysReasonLabels).countBy().entries().maxBy(_.last));
		} else if (selectedLineChart === 'overall') {
			lineChartTitle = 'Average Moods (Overall)';

			// group each mood entries by day
			const groupedByDay = _.groupBy(dataType, (entry) =>
				dayjs(entry.created_at).format('YYYY-MM-DD')
			); 

			overall = _.sortBy(_.keys(groupedByDay)); // x, all days recorded (sorted in ascending order)

			// y, average mood score for each day
			overallAverages = Object.values(groupedByDay).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			});

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
					reasonCounts[reason] = (reasonCounts[reason] || 0) + 1; // 0 if mood is not yet in reasonCounts, else increment by 1
					return reasonCounts;
				}, {});

			/*  
				convert the mostFreqMood and mostFreqReason objects into an array of [key, value] pairs, 
				sort it in descending order by value by subtracting nextElem[1] from currentElem[1],
				and take the first pair with shift() which is a method that removes the first element of an array and returns it 
			*/
			const moodValue = Object.entries(mostFreqMood)
				.sort((currentElem, nextElem) => nextElem[1] - currentElem[1])
				.shift();

			const reasonValue = Object.entries(mostFreqReason)
				.sort((currentElem, nextElem) => nextElem[1] - currentElem[1])
				.shift();

			// get the key of the constant mood object that has the value equal to the moodValue
			overallMostFreqMood = Object.keys(mood).find((key) => mood[key] == parseInt(moodValue[0]));

			// get the key of the constant reason object that has the value equal to the reasonValue
			overallMostFreqReason = Object.keys(reason).find( (key) => reason[key] === parseInt(reasonValue[0]));
		} else if (selectedLineChart === 'weekly') {
			lineChartTitle = 'Average Moods (Weekly)';

			// group each mood entries by week using the getWeekNumberString function
			const groupedByWeek = _.groupBy(dataType, (entry) =>
				getWeekNumberString(dayjs(entry.created_at))
			);

			weekly = _.sortBy(_.keys(groupedByWeek)); // x, all weeks recorded (sorted in ascending order)

			// y, get the average mood score for each week
			weeklyAverages = Object.values(groupedByWeek).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			});

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
					reasonCounts[reason] = (reasonCounts[reason] || 0) + 1; // 0 if mood is not yet in reasonCounts, else increment by 1
					return reasonCounts;
				}, {});

			/*  
				convert the mostFreqMood and mostFreqReason objects into an array of [key, value] pairs, 
				sort it in descending order by value by subtracting nextElem[1] from currentElem[1],
				and take the first pair with shift() which is a method that removes the first element of an array and returns it 
			*/
			const moodValue = Object.entries(mostFreqMood)
				.sort((currentElem, nextElem) => nextElem[1] - currentElem[1])
				.shift();

			const reasonValue = Object.entries(mostFreqReason)
				.sort((currentElem, nextElem) => nextElem[1] - currentElem[1])
				.shift();

			// get the key of the constant mood object that has the value equal to the moodValue
			weeklyMostFreqMood = Object.keys(mood).find((key) => mood[key] == parseInt(moodValue[0]));

			// get the key of the constant reason object that has the value equal to the reasonValue
			weeklyMostFreqReason = Object.keys(reason).find((key) => reason[key] == parseInt(reasonValue[0]));
		} else if (selectedLineChart === 'monthly') {
			lineChartTitle = 'Average Moods (Monthly)';

			// group each mood entries by month
			const groupedByMonth = _.groupBy(dataType, (entry) =>
				dayjs(entry.created_at).format('YYYY-MM')
			);

			monthly = _.sortBy(_.keys(groupedByMonth)); // x, all months recorded (sorted in ascending order)

			// y, get the average mood score for each month
			monthlyAverages = Object.values(groupedByMonth).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			});

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
					reasonCounts[reason] = (reasonCounts[reason] || 0) + 1; // 0 if mood is not yet in reasonCounts, else increment by 1
					return reasonCounts;
				}, {});

			/*  
				convert the mostFreqMood and mostFreqReason objects into an array of [key, value] pairs, 
				sort it in descending order by value by subtracting nextElem[1] from currentElem[1],
				and take the first pair with shift() which is a method that removes the first element of an array and returns it 
			*/
			const moodValue = Object.entries(mostFreqMood)
				.sort((currentElem, nextElem) => nextElem[1] - currentElem[1])
				.shift();

			const reasonValue = Object.entries(mostFreqReason)
				.sort((currentElem, nextElem) => nextElem[1] - currentElem[1])
				.shift();

			// get the key of the constant mood object that has the value equal to the moodValue
			monthlyMostFreqMood = Object.keys(mood).find((key) => mood[key] == parseInt(moodValue[0]));

			// get the key of the constant reason object that has the value equal to the reasonValue
			monthlyMostFreqReason = Object.keys(reason).find((key) => reason[key] == parseInt(reasonValue[0]));
		} else if (selectedLineChart === 'yearly') {
			lineChartTitle = 'Average Moods (Yearly)';

			// group each mood entries by year
			const groupedByYear = _.groupBy(dataType, (entry) => dayjs(entry.created_at).format('YYYY'));

			yearly = _.sortBy(_.keys(groupedByYear)); // x, all years recorded (sorted in ascending order)

			// y, get the average mood score for each year
			yearlyAverages = Object.values(groupedByYear).map((entries) => {
				const totalMoodScore = entries.reduce((sum, entry) => sum + parseInt(entry.mood_score), 0);
				const averageMoodScore = totalMoodScore / entries.length;
				return averageMoodScore;
			});

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
				.flatMap(([_, entries]) => entries) // get the entries from groupedByWeek object into a single array
				.reduce((reasonCounts, entry) => {
					const reason = entry.reason_score;
					reasonCounts[reason] = (reasonCounts[reason] || 0) + 1; // 0 if mood is not yet in reasonCounts, else increment by 1
					return reasonCounts;
				}, {});

			/*  
				convert the mostFreqMood and mostFreqReason objects into an array of [key, value] pairs, 
				sort it in descending order by value by subtracting nextElem[1] from currentElem[1],
				and take the first pair with shift() which is a method that removes the first element of an array and returns it 
			*/
			const moodValue = Object.entries(mostFreqMood)
				.sort((currentElem, nextElem) => nextElem[1] - currentElem[1])
				.shift();

			const reasonValue = Object.entries(mostFreqReason)
				.sort((currentElem, nextElem) => nextElem[1] - currentElem[1])
				.shift();

			// get the key of the constant mood object that has the value equal to the moodValue
			yearlyMostFreqMood = Object.keys(mood).find((key) => mood[key] == parseInt(moodValue[0]));

			// get the key of the constant reason object that has the value equal to the reasonValue
			yearlyMostFreqReason = Object.keys(reason).find((key) => reason[key] == parseInt(reasonValue[0]));
		}

		// FOR RADAR CHART - MOOD AND FREQUENCY OF RELATED REASONS
		const moodData = {};

		for (const entry of dataType) {
			// find the mood label corresponding to the student's mood score
			const moodLabel = Object.keys(mood).find((key) => mood[key] == entry.mood_score);

			if (moodLabel) {
				// if mood is found
				// initialize the moodData with the mood label (key) and an array of 0s (value)
				moodData[moodLabel] = Array(Object.keys(reason).length).fill(0);
			}
		}

		// loop through the student mood data and 
		// update the mood data object based on the mood and reason scores
		for (const entry of dataType) {

			// find the mood label corresponding to the mood score
			const moodLabel = Object.keys(mood).find((key) => mood[key] == entry.mood_score);

			// calculate the index for the reason score (subtracting 1 to match array indices)
			const reasonIndex = entry.reason_score - 1;

			// if a mood label exists and the reason index is valid (non-negative),
			// increment the corresponding moodData entry
			if (moodLabel && reasonIndex >= 0) {
				moodData[moodLabel][reasonIndex]++;
			}
		}

		// prepare data in a format suitable for a radar chart
		moodRadarData = Object.keys(moodData).map((moodLabel) => ({

			// map mood data to an array of values, 
			// representing number of occurences for each reason under each mood
			value: Object.keys(reason).map((reasonLabel) => moodData[moodLabel][reason[reasonLabel] - 1]),
			name: moodLabel
		}));
	
		// get the maximum value for each reason
		const maxValues = Object.keys(reason).map((reasonLabel) =>
			Math.max(...moodRadarData?.map((mood) => mood.value[reason[reasonLabel] - 1]))
		);

		// map over the keys of the 'reason' object. for each key ('reasonLabel'),
		// we're also getting its index in the array of keys ('reasonIndex').
		reasonRadarIndicator = Object.keys(reason).map((reasonLabel, reasonIndex) => {

			// get the maximum value for this reason from the 'maxValues' array.
			let maxValue = maxValues[reasonIndex];

			// one solution would be to set the interval to 1, but that would
			// make the chart look too cluttered.
			// is this optimal? i don't know. but it works for now.

			// [ECharts] The ticks may be not readable ... error
			// idk why this happens but it's probably because the ticks are too close together
			// so i'm just gonna set the max value to this (round up to the nearest multiple of 10)
			let roundedMax = Math.ceil(maxValue / 10) * 10;

			// return an object for this reason which includes the name of the reason 
			// and the max.
			return {
				name: reasonLabel,
				max: roundedMax
			};
		});

		// FOR NEGATIVE HORIZONTAL BAR CHART - MOOD AVERAGES BY COURSE/YEARLVL/REASON
		if (selectedNHBarChart === 'course') {

			// reduce the dataType object to an array of objects
			// where each object represents a course and its mood scores
			const courseData = dataType?.reduce((acc, entry) => {
				// find the course in the accumulator
				const existingCourse = acc.find((item) => item.course === entry.course);

				// if the course exists, push the mood score to its array
				if (existingCourse) {
					existingCourse.mood_scores.push(entry.mood_score);
				} 
				else { 
					// if not, create a new object for it and push it to the accumulator
					// which means that this is the first entry for this course
					acc.push({ course: entry.course, mood_scores: [entry.mood_score] });
				}
				return acc;
			}, []);

			// map over the courseData array and get the average mood score for each course
			avgMoodByCourse = courseData?.map((course) => {
				const moodScores = course.mood_scores; // get the mood scores for this course

				if (moodScores.length > 0) { // if there are mood scores for this course

					// get the total mood score for this course
					const totalMoodScore = moodScores.reduce((sum, score) => sum + parseInt(score), 0);

					// get the average mood score for this course
					const avgMoodScore = totalMoodScore / moodScores.length;

					if (avgMoodScore < 0) { // if average mood score is negative

						// return an object with the average mood score as the value
						// and the position of the label to the right of the bar
						// based on the example from apache echarts
						return { value: avgMoodScore, label: { position: 'right' } };
					} else {
						return avgMoodScore; // else return the average mood score
					}
				} else {
					return null; // if there are no mood scores for this course, return null
				}
			});

			// map over the courseData array and get the course labels
			courseYData = courseData?.map((course) => course.course);
		} else if (selectedNHBarChart === 'year_level') {

			// reduce the dataType object to an array of objects
			// where each object represents a year level and its mood scores
			const yearLevelData = dataType?.reduce((acc, entry) => {
				// find the year level in the accumulator
				const yearLevel = acc.find((item) => item.yearLevel === entry.year_level);

				if (yearLevel) { // if the year level exists, push the mood score to its array
					yearLevel.mood_scores.push(entry.mood_score);
				} 
				else { 
					// if not, create a new object for it and push it to the accumulator
					// which means that this is the first entry for this year level
					acc.push({ yearLevel: entry.year_level, mood_scores: [entry.mood_score] });
				}

				return acc; // return the accumulator
			}, []);

			// map over the yearLevelData array and get the average mood score for each year level
			avgMoodByYearLvl = yearLevelData?.map((yearLevel) => {
				const moodScores = yearLevel.mood_scores; // get the mood scores for this year level

				if (moodScores.length > 0) { // if there are mood scores for this year level

					// get the total mood score for this year level
					const totalMoodScore = moodScores.reduce((sum, score) => sum + parseInt(score), 0);

					// get the average mood score for this year level
					const avgMoodScore = totalMoodScore / moodScores.length;

					if (avgMoodScore < 0) { // if average mood score is negative

						// return an object with the average mood score as the value
						// and the position of the label to the right of the bar
						return { value: avgMoodScore, label: { position: 'right' } };
					} else {
						return avgMoodScore; // else return the average mood score
					}
				} else {
					return null; // if there are no mood scores for this year level, return null
				}
			});
			
			// map over the yearLevelData array and get the year level labels
			yearLvlYData = yearLevelData?.map((yearLevel) => {
				if (typeof yearLevel.yearLevel === 'number') { // if year level is a number
					return yearLvl[yearLevel.yearLevel]; // get the year level label from the yearLvl object
				} else {
					// if year level is not a number, remove the ' Level' from the string
					return yearLevel.yearLevel.replace(' Level', '');
				}
			});
		} else if (selectedNHBarChart === 'reason') {

			// reduce the dataType object to an array of objects
			// where each object represents a reason and its mood scores
			const reasonData = dataType?.reduce((acc, entry) => {
				
				// get the reason and mood scores from the current entry
				const { reason_score, mood_score } = entry;

				// find the reason in the accumulator
				const existingReason = acc.find((item) => item.reason_score === reason_score);

				if (existingReason) { 
					
					// if the reason exists already, push the mood score to its array
					existingReason.mood_scores.push(mood_score);
				} else {

					// if not, get the reason label from the reason object
					// and push a new object for it to the accumulator
					// since this is the first entry for this reason
					const reason_label = Object.keys(reason).find((key) => reason[key] === reason_score);
					acc.push({ reason_label, reason_score, mood_scores: [mood_score] });
				}
				return acc; // return the accumulator
			}, []);

			// map over the reasonData array and get the average mood score for each reason
			avgMoodByReason = reasonData?.map((reason) => {
				// get the mood scores for this reason
				const moodScores = reason.mood_scores;

				if (moodScores.length > 0) { // if there are mood scores for this reason,
					
					// get the total mood score for this reason
					// and get the average mood score for this reason
					const totalMoodScore = moodScores.reduce((sum, score) => sum + parseInt(score), 0);
					const avgMoodScore = totalMoodScore / moodScores.length;

					// if average mood score is negative,
					if (avgMoodScore < 0) {

						// return an object with the average mood score as the value
						// and the position of the label to the right of the bar
						return { value: avgMoodScore, label: { position: 'right' } };
					} else {
						return avgMoodScore; // else return the average mood score
					}
				} else {
					return null; // if there are no mood scores for this reason, return null
				}
			});

			// map over the reasonData array and get the reason labels
			reasonYData = reasonData?.map((reason) => reason.reason_label);
		}

		// LINE CHART BUTTON COLORS
		lcBtnColors = {
			today: selectedLineChart === 'today' ? 'blue' : 'light',
			overall: selectedLineChart === 'overall' ? 'blue' : 'light',
			weekly: selectedLineChart === 'weekly' ? 'blue' : 'light',
			monthly: selectedLineChart === 'monthly' ? 'blue' : 'light',
			yearly: selectedLineChart === 'yearly' ? 'blue' : 'light'
		};

		// NEGATIVE HORIZONTAL BAR CHART BUTTON COLORS
		nhbcBtnColors = {
			course: selectedNHBarChart === 'course' ? 'blue' : 'light',
			year_level: selectedNHBarChart === 'year_level' ? 'blue' : 'light',
			reason: selectedNHBarChart === 'reason' ? 'blue' : 'light'
		};

		// SIMPLE BAR CHART BUTTON COLORS
		sbcBtnColors = {
			min: selectedReasonMarkType === 'min' ? 'blue' : 'light',
			max: selectedReasonMarkType === 'max' ? 'blue' : 'light',
			average: selectedReasonMarkType === 'average' ? 'blue' : 'light'
		};

		// MARK TYPES FOR SIMPLE BAR CHART
		if(selectedReasonMarkType === 'average') { sbcMarkType = 'average' }
		else if(selectedReasonMarkType === 'min') { sbcMarkType = 'min' }
		else if(selectedReasonMarkType === 'max') { sbcMarkType = 'max' }

		// SIMPLE BAR CHART - # OF MOOD ENTRIES PER WEEKDAY
		// filter the dataType array to only include entries with the selected mood score
		let filteredSelectedMoodData = dataType?.filter(data => data.mood_score === selectedMoodScore);

		// group the filtered data by the day of the week when each entry was created
		const groupedDays = _.groupBy(filteredSelectedMoodData, (data) => {
			const date = new Date(data.created_at);
			return date.getDay();
		});

		// count the number of entries for each day of the week
		const entriesByWeekday = _.mapValues(groupedDays, data => data.length);

		// map the day numbers to their respective names
		xMoodWeek = _.keys(entriesByWeekday).map(dayNumber => daysShort[dayNumber]);

		// store the counts of entries for each day of the week
		yMoodWeekEntry = _.values(entriesByWeekday);

		// ----------------------------

		// SIMPLE BAR CHART - PERCENTAGE OF REASONS OF THE SELECTED MOOD
		// group the filtered data by the reason score
		const reasonCounts = _.countBy(filteredSelectedMoodData, 'reason_score');

		// calculate the percentage of total entries that each reason score represents
		const reasonPercentages = _.mapValues(reasonCounts, count => (count / filteredSelectedMoodData.length) * 100);

		// get the percentage values and reason labels
		yReasonPercentage = _.values(reasonPercentages);
		xReason = Object.keys(reasonPercentages).map(key => {
			return Object.keys(reason).find(label => reason[label] == key);
		});
	}

	$: if (studentMoodData) {
		recentStudent = studentMoodData?.slice(-1)[0]?.student_id; // for an info card

		// for table of students w consistent low moods

		// minor issue(?): since this logic only uses a svelte store to store
		// the students w consistent low moods and dili siya stored in a persistent 
		// storage like a database kay which means na it WILL always show the alert
		// notif every after user login even if there's no new data jud bitaw from the last login
		// but the alert WHEN there is new data is working fine japun
		// so like ... it's a feature ig... dk

		let filteredStudents = new Map();
		let consecutiveDaysMap = new Map();
		consistentLowMoods.set([]);

		// keep track of the maximum number of consecutive low mood days encountered
		let maxConsecutiveDays = 0; 
		// filter the student mood data to only include entries with negative mood scores
		filteredStudents = studentMoodData?.reduce(

			// extract the student id, mood score, created at, and reason score from each entry
			(students, { student_id, mood_score, created_at, reason_score }) => {
				if (!created_at || mood_score >= 0) {
					// if created_at is null or mood_score is not negative,
					return students; // skip this entry
				}

				// get the date of the entry in YYYY/MM/DD format
				const dateKey = new Date(created_at).toLocaleDateString('en-US', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit'
				});

				// get the student's data or create a new map()
				const studentData = students.get(student_id) || new Map(); 

				// get the reason label from the reason score using reason object
				const reason_label = Object.keys(reason).find((key) => reason[key] === reason_score);

				// add the moods and reasons to the student's data based on the corresponding date
				studentData.set(dateKey, {
					// moodScores is an array of mood scores for the day
					// reasonLabels is an array of reason labels for the day
					moodScores: [...(studentData.get(dateKey)?.moodScores || []), mood_score],
					reasonLabels: [...(studentData.get(dateKey)?.reasonLabels || []), reason_label]
				});

				return students.set(student_id, studentData); // update the student's data
			},
			new Map()
		);

		for (const [studentId, studentEntry] of filteredStudents) {
			// variable to be used for tracking consecutive low mood days
			let consecutiveDays = 0; 

			// variable to be used for checking if the current date is the next day of the previous date
			let previousDate = null; 

			// variable to be used for storing the current streak data
			let currentStreakData = null; 

			// for each date of mood data for a student, 
			// calculate the consecutive low mood days
			for (const [dateKey, moodData] of studentEntry) {
				const currentDate = dayjs(dateKey);

				// if the current date is the next day of the previous date, 
				// then increment the consecutive days
				if (previousDate === null || currentDate.diff(previousDate, 'day') === 1) {
					consecutiveDays++;
				} else {
					// else, reset the consecutive days to 1
					consecutiveDays = 1;
				}
				
				// if the consecutive days is >= to 4, 
				// then check if the previous date is the day before the current date
				if (consecutiveDays >= 4) {
					// get the last record of the student's streaks 
					// which is the last element of the array
					const lastRecord = (consecutiveDaysMap?.get(studentId) || []).slice(-1)[0]; 
					
					// if the last record's end date is the day before the current date, 
					// then update the last record
					if (
						lastRecord &&
						lastRecord.endDate === currentDate.subtract(1, 'day').format('MM/DD/YYYY')
					) {
						lastRecord.endDate = currentDate.format('MM/DD/YYYY'); // update the end date
						lastRecord.moodScores.push(...moodData.moodScores); // add the mood scores
						lastRecord.reasonLabels.push(...moodData.reasonLabels); // and reason labels
					} else { // else, create a new record

						// update the maximum consecutive days
						maxConsecutiveDays = Math.max(maxConsecutiveDays, consecutiveDays); 

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
							const streakDate = currentDate
								.subtract(consecutiveDays - 1 - i, 'day')
								.format('MM/DD/YYYY');

							// get the mood scores and reason labels of the streak date
							const streakMoodData = studentEntry.get(streakDate);

							// if there is mood data for the streak date, 
							// then add the mood scores and reason labels to the current streak data
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

			// `moods` is the current value of the store
			// add a new entry for a student’s streaks to the consistentLowMoods store.
			consistentLowMoods?.update((moods) => [...moods, { studentId, streaks: studentStreaks }]);
		});
	}

	/**
	 * This reactive statement checks if the 'tableRef' is defined and if 'focusTable' is true.
	 * If both conditions are true, it scrolls the window to the top offset of 'tableRef' and sets 'focusTable' to false.
	 * This is typically used to automatically scroll the user to a table after clicking `here` sa low moods notification.
	 * The check for 'window' ensures this code only runs in the browser where 'window' is defined, 
	 * not during server-side rendering.
	 */	
	$: if(typeof window !== 'undefined'){
		if (tableRef && $focusTable) {
			window?.scrollTo(0, tableRef?.offsetTop);
			focusTable?.update((value) => value = false);
		}
	}

	/**
	 * View selected line chart (Today/Weekly/Monthly/Yearly/Overall).
	 * @param {string} lineChart - The line chart selected by the user.
	 */
	 function selectLineChart(lineChart) {
		selectedLineChart = lineChart;
	}

	/**
	 * View selected bar chart for **Mood Averages Chart** (Course/Year Level/Reason).
	 * @param {string} barChart - The bar chart selected by the user.
	 */
	function selectNHBarChart(barChart) {
		selectedNHBarChart = barChart;
	}

	/**
	 * View selected reason mark type for **Associated Reason Frequency Chart** (Average/Min/Max).
	 * @param {string} reasonMarkType - The reason mark type selected by the user.
	 */
	function selectReasonMarkType(reasonMarkType) {
		selectedReasonMarkType = reasonMarkType;
	}

	/**
	 * Updates the `current` variable with the current date and time.
	*/
	function updateTime() {
		current = dayjs()
	}

	/**
	 * Handles the click event on an element to smoothly scroll to a target element.
	 * @param {MouseEvent} event
	 * The target of this event is expected to have an 'id' attribute that corresponds to the id of the target element to scroll to.
	*/
	function scrollIntoView({ target }) {
    const targetElement = document.getElementById(target.getAttribute('id'));
    if (!targetElement) return;
			targetElement.scrollIntoView({
      	behavior: 'smooth'
    });
  }
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<!-- Student/Anonymous Floating Toggle Button -->
{#if studentMoodData?.length > 0 || anonMoodData?.length > 0}
	<Tooltip placement="left" class="fixed z-50 overflow-hidden" triggeredBy="#switchData" on:hover={(e) => e.preventDefault()}>
		Toggle between student and anonymous data
	</Tooltip>

	<div id="switchData" class="flex justify-evenly space-x-2 bg-slate-900 p-2 rounded-full w-fit fixed right-4 bottom-4 z-20">
		<button class={!viewAnonData ? toggleBtnClass.active : toggleBtnClass.inactive}
			on:click={() => (viewAnonData = false)}>
			<p class={!viewAnonData ? 'text-white font-semibold tracking-widest' : 'text-slate-500 tracking-widest'}>
				STUDENT
			</p>
		</button>
		<button class={viewAnonData ? toggleBtnClass.active : toggleBtnClass.inactive}
			on:click={() => (viewAnonData = true)}>
			<p class={viewAnonData ? 'text-white font-semibold tracking-widest' : 'text-slate-500 tracking-widest'}>
				ANONYMOUS
			</p>
		</button>
	</div>
{/if}

<div class="bg-zinc-100 flex flex-col space-y-4 mx-4 pt-4">
	<!-- Card Section -->
	<div class="flex justify-between w-full">
		<CardInfo purpose="time" title="" bind:data={current} />
		<CardInfo purpose="recentStudent" title="Recent Student ID #:" bind:data={recentStudent} />
		<CardInfo purpose="helpType" title="Most Requested Help Type:" bind:data={mostFrequentRequestType} />

		{#if selectedLineChart === 'today'}
				<div>
					<CardInfo purpose="mood" title="Today's Top Mood:" bind:data={todayMostFreqMood} />
				</div>
				<div>
					<CardInfo purpose="reason" title="Today's Top Reason:" bind:data={todayMostFreqReason} />
				</div>
		{:else if selectedLineChart === 'overall'}
				<div>
					<CardInfo purpose="mood" title="Mood (Overall):" bind:data={overallMostFreqMood} />
				</div>
				<div>
					<CardInfo purpose="reason" title="Reason (Overall):" bind:data={overallMostFreqReason} />
				</div>
		{:else if selectedLineChart === 'weekly'}
				<div>
					<CardInfo purpose="mood" title="Mood (Weekly):" bind:data={weeklyMostFreqMood} />
				</div>
				<div>
					<CardInfo purpose="reason" title="Reason (Weekly):" bind:data={weeklyMostFreqReason} />
				</div>
		{:else if selectedLineChart === 'monthly'}
				<div>
					<CardInfo purpose="mood" title="Mood (Monthly):" bind:data={monthlyMostFreqMood} />
				</div>
				<div>
					<CardInfo purpose="reason" title="Reason (Monthly):" bind:data={monthlyMostFreqReason} />
				</div>
		{:else if selectedLineChart === 'yearly'}
				<div>
					<CardInfo purpose="mood" title="Mood (Yearly):" bind:data={yearlyMostFreqMood} />
				</div>
				<div>
					<CardInfo purpose="reason" title="Reason (Yearly):" bind:data={yearlyMostFreqReason} />
				</div>
		{/if} 
		
		<Tooltip placement="left" class="fixed z-50 overflow-hidden" triggeredBy="#jumpTo" on:hover={(e) => e.preventDefault()}>
			Jump to a specific section
		</Tooltip>

		<Button id="jumpTo" class="w-fit rounded-md" shadow on:click={() => jumpToModalState = true}>
			<ForwardSolid class="focus:outline-none" />
		</Button>
	</div>

	<div class="flex flex-col space-y-3 w-full">
		<div class="flex space-x-4">
			<!-- Mood Frequency Bar Chart -->
			<div id="overallMoodFreqHBC" class="p-3 bg-white rounded drop-shadow-md hover:ring-1 self-center flex justify-center items-center pt-6 px-5">
				{#if dataType?.length == 0}
					<div class="flex flex-col justify-center items-center space-y-5" style="width:520px; height:350px;">
						<RocketOutline class="h-20 w-20" />
						<p class="text-sm text-slate-500">Data currently <strong>unavailable</strong>.</p>
					</div>
				{:else}
					<div class="flex flex-col">
						<p class="font-semibold">Mood Frequency</p>
						<HorizontalMoodBarChart
							title=""
							xAxisName="Frequency" yAxisName=""
							bind:xData={xDataMBC}
							bind:yData={yDataMBC}
							elementID="dashboardHBC"
							style="width:520px; height:350px;"
						/>
					</div>
				{/if}
			</div>

			<!-- Line Chart -->
			<div id="lineChartMood" class="flex w-screen bg-white rounded drop-shadow-md items-center justify-center hover:ring-1">
				<div class="flex flex-col space-y-4">
					<div class="flex justify-between items-center mt-2">
						<p class="font-semibold">{lineChartTitle}</p>
						<ButtonGroup>
							<Button
								disabled={dataType.length == 0}
								color={lcBtnColors.today}
								on:click={() => selectLineChart('today')}>
								Today
							</Button>
							<Button
								disabled={dataType.length == 0}
								color={lcBtnColors.weekly}
								on:click={() => selectLineChart('weekly')}>
								Weekly
							</Button>
							<Button
								disabled={dataType.length == 0}
								color={lcBtnColors.monthly}
								on:click={() => selectLineChart('monthly')}>
								Monthly
							</Button>
							<Button
								disabled={dataType.length == 0}
								color={lcBtnColors.yearly}
								on:click={() => selectLineChart('yearly')}>
								Yearly
							</Button>
							<Button
								disabled={dataType.length == 0}
								color={lcBtnColors.overall}
								on:click={() => selectLineChart('overall')}>
								Overall
							</Button>
						</ButtonGroup>
					</div>
					{#if dataType?.length > 0}
						{#if selectedLineChart === 'today'}
							<LineChart
								bind:xData={timestamps}
								bind:yData={todaysMoodScores}
								elementID="dashboardTLC"
								style="width:670px; height:330px;"
							/>
						{:else if selectedLineChart === 'overall'}
							<LineChart
								bind:xData={overall}
								bind:yData={overallAverages}
								elementID="dashboardDLC"
								style="width:670px; height:330px;"
							/>
						{:else if selectedLineChart === 'weekly'}
							<LineChart
								bind:xData={weekly}
								bind:yData={weeklyAverages}
								elementID="dashboardWLC"
								style="width:670px; height:330px;"
							/>
						{:else if selectedLineChart === 'monthly'}
							<LineChart
								bind:xData={monthly}
								bind:yData={monthlyAverages}
								elementID="dashboardMLC"
								style="width:670px; height:330px;"
							/>
						{:else if selectedLineChart === 'yearly'}
							<LineChart
								bind:xData={yearly}
								bind:yData={yearlyAverages}
								elementID="dashboardYLC"
								style="width:670px; height:330px;"
							/>
						{/if}
					{:else}
						<div class="flex flex-col justify-center items-center space-y-5" style="width:690px; height:330px;">
							<RocketOutline class="h-20 w-20" />
							<p class="text-sm text-slate-500">Data currently <strong>unavailable</strong>.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="flex space-x-4">
			<!-- Heatmap -->
			<div id="moodFreqHeatmap" class="bg-white flex flex-col rounded drop-shadow-md p-4 hover:ring-1">
				{#if dataType.length > 0}
					<div class="flex justify-between mt-1">
						<p class="font-semibold">Mood Frequency by Day and Hour</p>
						<div class="flex items-center justify-end mr-1.5 space-x-2">
							<Checkbox class="cursor-pointer mr-0" bind:value={lowMoodsOnly} on:change={() => lowMoodsOnly = !lowMoodsOnly} />
							<p class="text-sm font-normal text-gray-500 dark:text-gray-400">Low Moods Only</p>
						</div>
					</div>
					<HeatmapChart
						{heatmapData}
						title=""
						elementID="dashboardHM"
						style="width:575px; height:335px;"
					/>
				{:else}
					<div class="flex flex-col justify-center items-center space-y-5" style="width:575px; height:335px;">
						<RocketOutline class="h-20 w-20" />
						<p class="text-sm text-slate-500">Data currently <strong>unavailable</strong>.</p>
					</div>
				{/if}
			</div>

			<!-- Reason Simple Bar Chart -->
			<div id="reasonFreqBC" class="bg-white rounded drop-shadow-md flex justify-center hover:ring-1 p-4">
				<div class="flex flex-col">
					{#if dataType?.length > 0}
					<div class="flex justify-between items-baseline">
						<p class="font-semibold">Associated Reason Frequency</p>
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
					<SimpleBarChart
							xData={xDataSBC} xType="category" xName="Reason"
							yData={yDataSBC} yType="value" yName="Frequency"  yAxisRotate="90"
							title=""
							fontSize="18"
							markType={sbcMarkType}
							elementID="reasonSBC"
							style="width:655px; height:315px;"
						/>
					{:else}
						<div class="flex flex-col justify-center items-center space-y-5" style="width:655px; height:315px;">
							<RocketOutline class="h-20 w-20" />
							<p class="text-sm text-slate-500">Data currently <strong>unavailable</strong>.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="flex space-x-4">
			<div class="p-4 bg-white rounded drop-shadow-md flex justify-center hover:ring-1">
				<!-- Radar Chart -->
				<div id="moodReasonRadarChart" class="flex flex-col">
					{#if dataType?.length > 0}
						<p class="font-semibold mt-1.5">Mood and Frequency of Related Reasons</p>
						<RadarChart
							bind:data={moodRadarData}
							bind:indicator={reasonRadarIndicator}
							elementID="moodReasonRadar"
							style="width:616px; height:370px;"
						/>
					{:else}
						<div class="flex flex-col justify-center items-center space-y-5" style="width:616px; height:370px;">
							<RocketOutline class="h-20 w-20" />
							<p class="text-sm text-slate-500">Data currently <strong>unavailable</strong>.</p>
						</div>
					{/if}
				</div>
			</div>
			<div class="p-4 bg-white rounded drop-shadow-md flex justify-center hover:ring-1">
				<!-- Mood Averages Bar Chart -->
				<div id="moodAvgCourseYrReason" class="flex flex-col">
					{#if dataType?.length > 0}
						<div class="flex justify-between items-baseline">
							<p class="font-semibold">Mood Averages</p>
							<ButtonGroup class="mb-3">
								<Button color={nhbcBtnColors.course} on:click={() => selectNHBarChart('course')}>
									Course
								</Button>
								<Button
									color={nhbcBtnColors.year_level}
									on:click={() => selectNHBarChart('year_level')}>
									Year Level
								</Button>
								<Button color={nhbcBtnColors.reason} on:click={() => selectNHBarChart('reason')}>
									Reason
								</Button>
							</ButtonGroup>
						</div>
						<div class="mt-3 items-center">
							{#if selectedNHBarChart === 'course'}
								<NegativeBarChart
									bind:xData={avgMoodByCourse}
									bind:yData={courseYData}
									elementID="courseBarChart-1"
									style="width:615px; height:335px;"
								/>
							{:else if selectedNHBarChart === 'year_level'}
								<NegativeBarChart
									bind:xData={avgMoodByYearLvl}
									bind:yData={yearLvlYData}
									elementID="yrLvlBarChart-1"
									style="width:615px; height:335px;"
								/>
							{:else if selectedNHBarChart === 'reason'}
								<NegativeBarChart
									bind:xData={avgMoodByReason}
									bind:yData={reasonYData}
									elementID="reasonBarChart-1"
									style="width:615px; height:335px;"
								/>
							{/if}
						</div>
					{:else}
						<div class="flex flex-col justify-center items-center space-y-5" style="width:615px; height:335px;">
							<RocketOutline class="h-20 w-20" />
							<p class="text-sm text-slate-500">Data currently <strong>unavailable</strong>.</p>
						</div>
					{/if}
				</div>
			</div>
		</div>

		<div class="flex space-x-4">
			<!-- Histogram Chart -->
			<div id="moodLoginHrsHistogram" class="p-4 bg-white rounded drop-shadow-md flex justify-center hover:ring-1">
				{#if dataType?.length > 0}
					<div class="flex flex-col">
						<p class="font-semibold mt-1">Mood Login Hours (in 24-hour format)</p>
						<Histogram data={dataType} title=""
							elementID="LoginHrsHistogram" 
							style="width:510px; height:370px;"
						/>
					</div>
				{:else}
					<div class="flex flex-col justify-center items-center space-y-5" style="width:510px; height:370px;">
						<RocketOutline class="h-20 w-20" />
						<p class="text-sm text-slate-500">Data currently <strong>unavailable</strong>.</p>
					</div>
				{/if}
			</div>
			<!-- Students with Consistent Low Moods Table -->
			<div id="low-moods" bind:this={tableRef} class="bg-white rounded !p-5 drop-shadow-md w-full hover:ring-1">
				<caption class="mx-3 text-left w-max text-black bg-white dark:text-white dark:bg-gray-800 mb-6">
					<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
						Click the <strong>ID Number</strong> to view their student and mood information.
					</p>
					<p class="mt-2 text-xs font-normal text-gray-500 dark:text-gray-400">
						(Student/s who have experienced low moods for <span class="font-semibold">atleast 4 consecutive days.</span>)
					</p>
				</caption>
				<Table divClass={tableDivClass}>
					<TableHead class="bg-zinc-100 border border-t border-zinc-300 top-0 sticky text-center">
						<TableHeadCell>ID Number</TableHeadCell>
						<TableHeadCell>Time Period</TableHeadCell>
						<TableHeadCell class="text-center">Average Mood</TableHeadCell>
						<TableHeadCell class="text-center">Prevailing Reason</TableHeadCell>
					</TableHead>
					<TableBody tableBodyClass="divide-y bg-white">
						{#if $consistentLowMoods === undefined || $consistentLowMoods.length === 0}
							<TableBodyRow class="border border-zinc-300 text-center">
								<TableBodyCell>No data</TableBodyCell>
								<TableBodyCell>No data</TableBodyCell>
								<TableBodyCell>No data</TableBodyCell>
								<TableBodyCell>No data</TableBodyCell>
							</TableBodyRow>
						{:else}
							{#each $consistentLowMoods as student}
								{#each student.streaks as streak}
									<TableBodyRow>
										<TableBodyCell class="text-center">
											<a class="hover:underline" href="/students/student-mood-information?search={student.studentId}"
												rel="noopener noreferrer">
												{student.studentId}
											</a>
										</TableBodyCell>
										<TableBodyCell class="text-center">
											{streak.startDate} - {streak.endDate}
										</TableBodyCell>
										<TableBodyCell class="text-center">
											{
												Object.keys(mood).find(
													(key) =>
														mood[key] ===
														Math.round(
															streak.moodScores.reduce((accum, elem) => accum + parseInt(elem), 0) /
															streak.moodScores.length
													)
												)
											}
										</TableBodyCell>
										<TableBodyCell class="text-center">
											{(() => {
												// Immediately Invoked Function Expression
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
													return 'Multiple Reasons*';
												}
											})()}
										</TableBodyCell>
									</TableBodyRow>
								{/each}
							{/each}
						{/if}
					</TableBody>
				</Table>
			</div>
			<!-- soon: maybe add an export data button here...?? -->
		</div>

		<!-- Calendar Chart -->
		<div id="moodCalendar" class="bg-white rounded drop-shadow-md flex justify-center hover:ring-1">
			<div class="flex flex-col mt-1 px-4">
				{#if dataType?.length > 0}
					<div class="flex flex-row justify-between space-y-3 mt-4">
						<div class="flex flex-col justify-start items-center mt-2">
							<p class="font-semibold self-start">Mood-Reason Calendar</p>
							<p class="text-xs">(Please select a mood and the associated reason.)</p>
						</div>
						<div class="flex flex-row space-x-3">
							<Select placeholder="Select Mood" class="font-normal w-max h-11 bg-white" items={moodChoices} bind:value={selectedMoodCalendar} />
							<Select placeholder="Select Associated Reason" class="font-normal w-max h-11 bg-white" items={reasonChoices} bind:value={selectedReasonCalendar} />
						</div>
					</div>
					<div class="items-center">
						<CalendarChart 
							data={dataType} seriesName="Mood-Reason Calendar"
							bind:reasonType={selectedReasonCalendar} 
							bind:moodType={selectedMoodCalendar}
							elementID="moodCalendarChart" 
							style="width:1270px;height:250px"
						/>
					</div>
				{:else}
					<div class="flex flex-col justify-center items-center w-full space-y-5 my-4">
						<RocketOutline class="h-20 w-20" />
						<p class="text-sm text-slate-500">Data currently <strong>unavailable</strong>.</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- 2 Charts (# of Mood Entries per Weekday & % of Reasons of the Selected Mood) -->
		<div id="2Charts" class="p-3 w-full bg-white rounded drop-shadow-md flex justify-center hover:ring-1">
			<div class="flex flex-col w-full space-y-4 p-2">
				{#if dataType?.length > 0}
				<div class="flex justify-between items-baseline">
					<p class="text-sm">Current Mood: <span class="font-semibold">{Object.keys(mood).find((key) => mood[key] === selectedMoodScore) || 'N/A'}</span></p>
					<Select placeholder="Select a mood" class="font-normal w-fit bg-white" items={moodChoices} bind:value={selectedMoodScore} />
				</div>
				<div class="flex space-x-3 justify-between mt-1"> 
					<div class="items-center">
						<SimpleBarChart
							xData={xMoodWeek} xType="category" xName="Day"
							yData={yMoodWeekEntry} yType="value" yName="Frequency" yAxisRotate="90"
							title="         # of Mood Entries per Weekday"
							markType="average"
							elementID="moodWeekDayEntries" fontSize="16"
							style="width:590px; height:320px;"
						/>
					</div>

					<div class="items-center">
						<SimpleBarChart
							yData={yReasonPercentage} yType="value" yName="Percentage" yAxisRotate="90"
							xData={xReason} xType="category" xName="Reason"
							title="         % of Reasons of the Selected Mood"
							markType="average"
							elementID="percentageReason" fontSize="16"
							style="width:590px; height:320px;"
						/>
					</div>
				</div>
				{:else}
					<div class="flex flex-col justify-center items-center w-full space-y-5">
						<RocketOutline class="h-20 w-20" />
						<p class="text-sm text-slate-500">Data currently <strong>unavailable</strong>.</p>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<Modal class="flex relative max-w-fit w-full max-h-full" title="Jump to a specific section" bind:open={jumpToModalState} autoclose>
	<div class="flex flex-col gap-3">
		<!-- 
			NOTE: The `href` attribute in this case is just used to provide a fallback for 
			browsers that don’t support JavaScript or in case JavaScript fails to load. 
			So even without JS, clicking the link will still take you to the right section of the page.
		-->
		<a href="#overallMoodFreqHBC" on:click={scrollIntoView}>
			<div class="flex gap-3 items-center">
				<ChartMixedOutline class="focus:outline-none h-6 w-6 text-blue-700" /> 
				<p class="text-sm">Overall Mood Frequency Chart</p>
			</div>
		</a>
		<a href="#lineChartMood" on:click={scrollIntoView}>
			<div class="flex gap-3 items-center">
				<ChartOutline class="focus:outline-none h-6 w-6 text-blue-700" /> 
				<p class="text-sm">Mood Line Chart</p>
			</div>
		</a>
		<a href="#moodFreqHeatmap" on:click={scrollIntoView}>
			<div class="flex gap-3 items-center">
				<CalendarMonthOutline class="focus:outline-none h-6 w-6 text-blue-700" /> 
				<p class="text-sm">Mood Frequency by Day and Hour Chart</p>
			</div>
		</a>
		<a href="#reasonFreqBC" on:click={scrollIntoView}>
			<div class="flex gap-3 items-center">
				<ChartMixedOutline class="focus:outline-none h-6 w-6 text-blue-700" /> 
				<p class="text-sm">Associated Reason Frequency Chart</p>
			</div>
		</a>
		<a href="#moodReasonRadarChart" on:click={scrollIntoView}>
			<div class="flex gap-3 items-center">
				<ChartMixedOutline class="focus:outline-none h-6 w-6 text-blue-700" /> 
				<p class="text-sm">Mood and Frequency of Related Reasons Chart</p>
			</div>
		</a>
		<a href="#moodAvgCourseYrReason" on:click={scrollIntoView}>
			<div class="flex gap-3 items-center">
				<ChartMixedOutline class="focus:outline-none h-6 w-6 text-blue-700" /> 
				<p class="text-sm">Mood Averages (Course/Year Level/Reason)</p>
			</div>
		</a>
		<a href="#moodLoginHrsHistogram" on:click={scrollIntoView}>
			<div class="flex gap-3 items-center">
				<ChartMixedOutline class="focus:outline-none h-6 w-6 text-blue-700" /> 
				<p class="text-sm">Mood Login Hours (in 24-hour format)</p>
			</div>
		</a>
		<a href="#low-moods" on:click={scrollIntoView}>
			<div class="flex gap-3 items-center">
				<TableColumnOutline class="focus:outline-none h-6 w-6 text-blue-700" /> 
				<p class="text-sm">Table of Students with Consistent Low Moods</p>
			</div>
		</a>
		<a href="#moodCalendar" on:click={scrollIntoView}>
			<div class="flex gap-3 items-center">
				<CalendarMonthOutline class="focus:outline-none h-6 w-6 text-blue-700" /> 
				<p class="text-sm">Mood Calendar</p>
			</div>
		</a>
		<a href="#2Charts" on:click={scrollIntoView}>
			<div class="flex gap-3 items-center">
				<ChartMixedOutline class="focus:outline-none h-6 w-6 text-blue-700" /> 
				<p class="text-sm">Selected Mood Bar Charts</p>
			</div>
		</a>
	</div>
</Modal>