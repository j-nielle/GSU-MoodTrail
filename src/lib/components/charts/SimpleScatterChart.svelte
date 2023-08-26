<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
  import { moodColors } from '$lib/etc/index.js'

	export let data;
  export let elementID;

	let scatterChart;

	onMount(() => {
		scatterChart = echarts.init(document.getElementById(elementID));

		scatterChart.setOption({
			title: {
				text: 'Scatter'
			},
      xAxis: {},
      yAxis: {},
			series: [{
        data: data,
        type: 'scatter'
      }],
			tooltip: {
				show: true,
				trigger: 'item'
			},
			toolbox: {
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
			scatterChart.dispose();
		};
	});

	afterUpdate(() => {
		scatterChart.setOption({
			series: [{
        data: data
      }]
		});
	});
</script>

<div id={elementID} style="width:490px; height:350px;" />
