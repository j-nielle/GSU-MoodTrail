<script>
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let xData;
	export let yData;

	let lineChart

	$: console.log('LineChart.svelte:', xData, yData);
	
	onMount(() => {
		lineChart = echarts.init(document.getElementById('lineMoodScore'));

		lineChart.setOption({
			title: {
				text: 'Line Chart'
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
			lineChart.dispose();
		};
	});

	afterUpdate(() => {
		console.log('afterUpdate()')
    lineChart.setOption({
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

<div id="lineMoodScore" style="width:750px;height:300px;" />
