<script>
	import * as echarts from 'echarts';
	import { onMount } from 'svelte';

	export let xData;
	export let yData;

	onMount(() => {
		const lineChart = echarts.init(document.getElementById('lineMoodScore'));

		lineChart.setOption({
			title: {
				text: 'Line Chart'
			},
			xAxis: {
				type: 'category',
				data: xData
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
				valueFormatter: (value) => 'Average Mood: ' + value.toFixed(3)
			}
		});

		return () => {
			lineChart.dispose();
		};
	});
</script>

<div id="lineMoodScore" style="width:750px;height:300px;" />
