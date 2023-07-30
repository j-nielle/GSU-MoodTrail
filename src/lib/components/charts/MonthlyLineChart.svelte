<script>
	// @ts-nocheck

	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let xData;
	export let yData;

	let monthlyLineChart;

	onMount(() => {
		monthlyLineChart = echarts.init(document.getElementById('monthlyLineChart'));

		monthlyLineChart.setOption({
			title: {
				text: 'Monthly Mood Averages'
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
			monthlyLineChart.dispose();
		};
	});

	afterUpdate(() => {
		console.log('afterUpdate()');
		monthlyLineChart.setOption({
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

<div id="monthlyLineChart" class="m-2" style="width:800px;height:270px;"/>

