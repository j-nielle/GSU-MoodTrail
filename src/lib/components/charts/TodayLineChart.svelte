<script>
	// @ts-nocheck

	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let xData;
	export let yData;

	let todayLineChart;

	onMount(() => {
		todayLineChart = echarts.init(document.getElementById('todayLineChart'));

		todayLineChart.setOption({
			title: {
				text: "Today's Moods"
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
				formatter: 'Mood Score: {c}'
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
			todayLineChart.dispose();
		};
	});

	afterUpdate(() => {
		console.log('afterUpdate()');
		todayLineChart.setOption({
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

<div id="todayLineChart" class="m-2" style="width:800px;height:270px;"/>

