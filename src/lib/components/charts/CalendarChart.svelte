<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let data;
	export let elementID;
	export let style;
	export let reasonType = '';
	export let moodType = '';
	export let seriesName = '';

	let calendarChart;
	let dataUnavailable = false;

	/**
	 * This function groups and counts data entries by date for a specific reason and mood type.
	 *
	 * @param {Array} dataType - An array of data objects. Each object should have 'created_at', 'reason_score', and 'mood_score' properties.
	 *
	 * @returns {Array} finalData - An array of arrays. Each sub-array contains a date string in the format 'yyyy-MM-dd' and the count of entries for that date.
	 *
	 * @example
	 * 
	 * getCalendarData([
	 *   {created_at: '2023-10-31T10:16:04+08:00', reason_score: 1, mood_score: 1},
	 *   {created_at: '2023-11-01T10:16:04+08:00', reason_score: 1, mood_score: 1},
	 *   {created_at: '2023-11-01T10:16:04+08:00', reason_score: 1, mood_score: 1}
	 * ]);
	 * 
	 * // returns [['2023-10-31', 1], ['2023-11-01', 2]]
	*/
	function getCalendarData(dataType){
		// check if echarts is defined
		if (!echarts || !echarts.time) {
			console.error('echarts or echarts.time is not defined');
			return [];
		}

		// use reduce to create the dataMap
		const dataMap = dataType?.reduce((map, item) => {
			// convert the date string to a timestamp
			const date = +echarts.time.parse(item?.created_at);

			// format the date to 'yyyy-MM-dd', false means not UTC
			const formattedDate = echarts.time.format(date, '{yyyy}-{MM}-{dd}', false);

			const reasonScore = item?.reason_score; // get the reason_score for current item
			const moodScore = item?.mood_score; // get the mood_score for current item

			// check if reasonType and moodType are defined and if reasonScore and moodScore match
			if (reasonType && moodType && reasonScore == reasonType && moodScore == moodType) {
				// add the formattedDate to the map and increment the count by 1
				// if the formattedDate is not in the map, set the count to 1
				map.set(formattedDate, (map.get(formattedDate) || 0) + 1);
			}

			return map; // return the map
		}, new Map());

		// convert the map entries to an array
		const finalData = Array.from(dataMap.entries());

		if (finalData.length === 0) {
			dataUnavailable = true;
		} else {
			dataUnavailable = false;
		}

		return finalData; // return the finalData
	}

	$: {
		if(dataUnavailable){
			calendarChart?.showLoading();
		}else {
			calendarChart?.hideLoading();
		}
	}

	onMount(() => {
		calendarChart = echarts?.init(document?.getElementById(elementID));

		calendarChart?.setOption({
			tooltip: {
				position: 'top',
				formatter: (params) => {
					return '[' + params.value[0] + ']' + ' Total: ' + params.value[1];
				}
			},
			textStyle: {
				fontFamily: "Inter"
			},
			visualMap: {
				show: false,
				min: 0,
				max: 50
			},
			calendar: {
				left: 22,
				right: 1,
    		range: dayjs().format('YYYY'),
 		 	},
			series: [
				{
					type: 'heatmap',
					name: seriesName,
    			coordinateSystem: 'calendar',
					data: getCalendarData(data)
				}
			],
			toolbox: {
				left: 0,
				show: true,
				feature: {
					dataView: {
						show: true,
						readOnly: false
					},
					saveAsImage: {
						show: true
					}
				}
			}
		});

		return () => {
			calendarChart?.dispose();
		};
	});

	afterUpdate(() => {
		calendarChart?.setOption({
			calendar: {
    		range: dayjs().format('YYYY'),
 		 	},
			series: [
				{
					data: getCalendarData(data)
				}
			],
		});
	});
</script>

<div id={elementID} {style} />
