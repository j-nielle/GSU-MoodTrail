<script>
	// @ts-nocheck
	import { minBy } from 'lodash';
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let xData;
	export let yData;

	let dailyLineChart;
	let mood;

	function getNearestMoodLabel(score) {
		const moodLabels = [
			'Sad',
			'Annoyed',
			'Nervous',
			'Bored',
			'Neutral',
			'Calm',
			'Relaxed',
			'Happy',
			'Excited'
		];
		const moodScores = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

		const nearestIndex = minBy(moodScores, (moodScore) => Math.abs(moodScore - score));
		return moodLabels[moodScores.indexOf(nearestIndex)];
	}

	$: mood = yData.map((score) => getNearestMoodLabel(score));

	onMount(() => { 
		dailyLineChart = echarts.init(document.getElementById('dailyLineChart'));

		if (!xData || !yData) {
			dailyLineChart.showLoading();
		} else {
			dailyLineChart.hideLoading();
		}

		dailyLineChart.setOption({
			title: {
				text: 'Daily Mood Averages',
				itemGap: 12,
				subtext:
					'Sad (-4), Annoyed (-3), Nervous (-2), Bored (-1), Neutral (0), Calm (1), Relaxed (2), Happy (3), Excited (4)',
				subtextStyle: {
					fontSize: 11
				}
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
				formatter: (params) => {
					const index = params[0].dataIndex;
					const moodScore = yData[index].toFixed(4);
					const moodLabel = mood[index];
					return `Nearest Mood: ${moodLabel} (<span class="font-bold">${moodScore}</ span>)`;
				}
			},
			toolbox: {
				show: true,
				feature: {
					dataZoom: {
						show: true,
						yAxisIndex: 'none'
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
			}
		});

		return () => {
			dailyLineChart.dispose();
		};
	});

	afterUpdate(() => {
		console.log('afterUpdate()');
		dailyLineChart.setOption({
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

<div id="dailyLineChart" class="m-2" style="width:890px; height:290px;" />