<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
	import { mood, getNearestMoodLabel } from '$lib/constants/index.js';

	export let xData;
	export let yData;
	export let elementID;
	export let style;

	let negativeBarChart;

	onMount(() => {
		negativeBarChart = echarts.init(document.getElementById(elementID));

		negativeBarChart.setOption({
			title: {
				subtext:
					'Sad (-4), Annoyed (-3), Nervous (-2), Bored (-1), Neutral (0), \nCalm (1), Relaxed (2), Happy (3), Excited (4)',
				subtextStyle: {
					fontSize: 11
				},
        textStyle:{
          color: '#000000'
        }
			},
			textStyle: {
				fontFamily: "Inter"
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
				formatter: (params) => {
					const value = params[0].value;

					let moodScore;
					value?.length < 3 ? (moodScore = value) : (moodScore = value.toFixed(2));
					const currentMood = getNearestMoodLabel(value, mood);
					
					return `Average Mood: <strong>${currentMood}</strong> [${moodScore}]`;
				}
			},
			xAxis: {
				name: "Mood Score",
				nameLocation: "middle",
        nameGap: 35,
				type: 'value',
				position: 'bottom',
				splitLine: {
					lineStyle: {
						type: 'dashed'
					}
				}
			},
			yAxis: {
				type: 'category',
				axisLine: { show: false },
				axisLabel: { show: false },
				axisTick: { show: false },
				splitLine: { show: false },
				data: yData
			},
			series: [
				{
					type: 'bar',
					label: {
						show: true,
						formatter: '{b}',
						borderWidth: 0
					},
					emphasis: {
						focus: 'self'
					},
					itemStyle: {
						color: '#1a56db'
					},
					data: xData
				}
			],
			toolbox: {
				show: true,
				feature: {
					dataZoom: {
						show: true,
            yAxisIndex: true
					},
          restore: {
            show: true
          },
					saveAsImage: {
						show: true
					}
				}
			}
		});

		return () => {
			negativeBarChart.dispose();
		};
	});

	afterUpdate(() => {
		negativeBarChart.setOption({
			yAxis: {
				data: yData
			},
			series: [
				{
					data: xData
				}
			]
		});
	});
</script>

<div id={elementID} {style} />
