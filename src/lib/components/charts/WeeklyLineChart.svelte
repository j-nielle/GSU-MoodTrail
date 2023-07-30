<script>
	// @ts-nocheck

	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let xData;
	export let yData;

	let weeklyLineChart;

	onMount(() => {
		weeklyLineChart = echarts.init(document.getElementById('weeklyLineChart'));

		weeklyLineChart.setOption({
			title: {
				text: 'Weekly Mood Averages'
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
				show: true,
				trigger: 'axis',
				formatter: 'Average Mood Score: {c}'
			}, 
			toolbox: {
				show: true,
				feature: {
					dataZoom: {
						show: true,
						yAxisIndex: "none"
					},
					dataView: {
						show: true,
						readOnly: false
					},
					restore: {
						show: true
					},
					saveAsImage: {
						show: true
					}
				}
			},
		});

		return () => {
			weeklyLineChart.dispose();
		};
	});

	afterUpdate(() => {
		console.log('afterUpdate()');
		weeklyLineChart.setOption({
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

<div id="weeklyLineChart" class="m-2" style="width:800px;height:270px;"/>

