<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
	import { moodColors } from '$lib/constants/index.js';

	export let xData;
	export let yData;
	export let elementID;
	export let style;
	export let title;

	let horizontalMoodBarChart;

	onMount(() => {
		horizontalMoodBarChart = echarts.init(document.getElementById(elementID));

		horizontalMoodBarChart.setOption({
			title: {
				text: title,
        textStyle:{
          color: '#000000',
					fontSize: 20,
        },
			},
			yAxis: {
				type: 'category',
				data: xData,
				axisLabel: {
					fontSize: 10,
					interval: 0
				}
			},
			xAxis: {
				type: 'value',
				name: "Frequency",
        nameRotate: 0,
        nameLocation: "center",
        nameGap: 35,
				axisLabel: {
					fontSize: 10
				}
			},
			series: [
				{
					data: yData,
					type: 'bar',
					barMaxWidth: 20,
					emphasis: {
						focus: 'self'
					},
					itemStyle: {
						color: function (params) {
							return moodColors[params.name] || '#5470c6';
						}
					}
				}
			],
			textStyle: {
				fontFamily: "Inter"
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				}
			},
			toolbox: {
				show: true,
				feature: {
					dataZoom: {
						show: true,
						xAxisIndex: 'none'
					},
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
			horizontalMoodBarChart.dispose();
		};
	});

	afterUpdate(() => {
		horizontalMoodBarChart.setOption({
			yAxis: {
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

<div id={elementID} {style} />
