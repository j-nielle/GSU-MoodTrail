<script>
	// @ts-nocheck

	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let xData;
	export let yData;

	let dailyLineChart;

	onMount(() => {
		dailyLineChart = echarts.init(document.getElementById('dailyLineChart'));

		dailyLineChart.setOption({
			title: {
				text: 'Daily Mood Averages'
			},
			xAxis: {
				type: 'category',
				data: xData,
				axisLine: {
					onZero: false
				}
			},
			yAxis: {
				type: 'value'
			},
			series: [
				{
					data: yData,
					type: 'line'
				}
			],
			tooltip: {
				show: 'true',
				trigger: 'axis',
				valueFormatter: (value) => 'Average Mood: ' + value
			}
		});

		return () => {
			dailyLineChart.dispose();
		};
	});

	afterUpdate(() => {
		console.log('afterUpdate()');
		dailyLineChart.setOption({
			xAxis: {
				data: xData
			},
			series: [
				{
					data: yData
				}
			]
		});
	});
</script>

<div id="dailyLineChart" class="m-2" style="width:800px;height:270px;"/>

