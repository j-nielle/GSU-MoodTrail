<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
	import { moodColors } from '$lib/constants/index.js';

	export let xData;
	export let yData;
	export let elementID;
	export let style;
	export let title = '';
	export let xAxisName = '';
	export let yAxisName = '';

	let horizontalMoodBarChart;

	onMount(() => {
		horizontalMoodBarChart = echarts?.init(document?.getElementById(elementID));

		window?.addEventListener('resize', () => {
			horizontalMoodBarChart?.resize();
			//console.log('Window resized, horizontal bar chart updated.');
		});

		horizontalMoodBarChart?.setOption({
			title: {
				text: title,
        textStyle:{
          color: '#000000',
					fontSize: 16,
					fontStyle: "normal",
					fontWeight: 500
        },
			},
			yAxis: {
				type: 'category',
				name: yAxisName,
				data: xData,
				axisLabel: { show: false },
			},
			xAxis: {
				type: 'value',
				name: xAxisName,
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
					name: "Frequency",
					type: 'bar',
					barWidth: "75%",
					emphasis: {
						focus: 'self'
					},
					label: {
						show: true,
						formatter: '{b}',
						borderWidth: 0
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
						yAxisIndex: 'none'
					},
					restore: {
						show: true
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
			window?.removeEventListener('resize', () => {
				horizontalMoodBarChart?.resize();
			});
			horizontalMoodBarChart.dispose();
		};
	});

	afterUpdate(() => {
		horizontalMoodBarChart?.setOption({
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
