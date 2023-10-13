<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	//export let title;
	export let data;
	export let elementID;
	export let style;
	export let reasonType;

	let getCalendarData;

	$: getCalendarData = (dataType) => {
		const final = [];
		const dataMap = new Map(); // this is to group the data by date

		for (let i = 0; i < dataType.length; i++) {
			const date = +echarts?.time.parse(dataType[i]?.created_at);
			const formattedDate = echarts?.time.format(date, '{yyyy}-{MM}-{dd}', false);
			const score = dataType[i].reason_score;
			if (!reasonType) { return; }
      else if (score == reasonType) {
        if (dataMap.has(formattedDate)) {
          dataMap.set(formattedDate, dataMap.get(formattedDate) + 1);
        } else {
          dataMap.set(formattedDate, 1);
        }
      }
		}
		for (const [date, count] of dataMap.entries()) {
			final.push([date, count]); // push the date and count to the final array (e.g [2021-01-01, 1])
		}
		console.log(final)
		return final;
	}

	let calendarChart;

	onMount(() => {
		calendarChart = echarts?.init(document.getElementById(elementID));

		calendarChart?.setOption({
			tooltip: {
				position: 'top',
				formatter: (params) => {
					return '[' + params.value[0] + ']' + ' Total Reasons: ' + params.value[1];
				}
			},
			textStyle: {
				fontFamily: "Inter"
			},
			visualMap: {
				show: false,
				min: 0,
				max: 10
			},
			calendar: {
    		range: dayjs().format('YYYY'),
 		 	},
			series: [
				{
					type: 'heatmap',
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
