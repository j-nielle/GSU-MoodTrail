<script>
	// @ts-nocheck
	import { minBy } from 'lodash';
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
	import { moodScores, moodLabels } from '$lib/constants/index.js';

	export let xData;
	export let yData;
	export let elementID;
	export let style;

	let negativeBarChart;
	let mood;

	function getNearestMoodLabel(score) {
		const nearestIndex = minBy(moodScores, (moodScore) => Math.abs(moodScore - score));
		return moodLabels[moodScores.indexOf(nearestIndex)];
	}

	$: mood = xData?.map((score) => getNearestMoodLabel(score));

	onMount(() => {
		negativeBarChart = echarts.init(document.getElementById(elementID));

		negativeBarChart.setOption({
			title: {
				subtext:
					'Sad (-4), Annoyed (-3), Nervous (-2), Bored (-1), Neutral (0), Calm (1), Relaxed (2), Happy (3), Excited (4)',
				subtextStyle: {
					fontSize: 11
				}
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				},
				formatter: (params) => {
					const index = params[0].dataIndex;
					const moodScore = xData[index].toFixed(2);
					const moodLabel = mood[index];
					return `<span class="font-bold">[${moodScore}]</span> Mood: <span class="font-bold">${moodLabel}</span>`;
				}
			},
			xAxis: {
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
					stack: 'Total',
					label: {
						show: true,
						formatter: '{b}'
					},
					emphasis: {
						focus: 'self'
					},
					itemStyle: {
						color: '#111827'
					},
					data: xData
				}
			]
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
