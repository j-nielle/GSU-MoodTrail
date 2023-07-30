<script>
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let xData;
	export let yData;

	let yearlyLineChart;

	onMount(() => {
		yearlyLineChart = echarts.init(document.getElementById('yearlyLineChart'));

		yearlyLineChart.setOption({
			title: {
				text: 'Yearly Mood Averages'
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
			yearlyLineChart.dispose();
		};
	});

	afterUpdate(() => {
		console.log('afterUpdate()');
		yearlyLineChart.setOption({
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

<div id="yearlyLineChart" class="m-2" style="width:800px;height:270px;"/>

