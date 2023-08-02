<script>
	// @ts-nocheck
	import { minBy } from 'lodash';
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let xData;
	export let yData;

	let todayLineChart;
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

		// a lodash function that returns the object with the minimum value of the callback function
		// which is the absolute value of the difference between the mood score and the current score
		// a.k.a the nearest mood score
		const nearestIndex = minBy(moodScores, (moodScore) => Math.abs(moodScore - score));
		return moodLabels[moodScores.indexOf(nearestIndex)];
	}

	$: mood = yData.map((score) => getNearestMoodLabel(score));

	onMount(() => {
		todayLineChart = echarts.init(document.getElementById('todayLineChart'));

		if (!xData || !yData) {
			todayLineChart.showLoading();
		} else {
			todayLineChart.hideLoading();
		}

		todayLineChart.setOption({
			title: {
				text: "Today's Moods",
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
				show: true,
				trigger: 'axis',
				formatter: (params) => {
					const index = params[0].dataIndex;
					const moodScore = yData[index].toFixed(2);
					const moodLabel = mood[index];
					return `Mood: ${moodLabel} (<span class="font-bold">${moodScore}</span>)`;
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
			todayLineChart.dispose();
		};
	});

	afterUpdate(() => {
		console.log('afterUpdate() lengths:',yData.length, xData.length);  
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
	console.log('lengths:',yData.length, xData.length); 
</script>

<div id="todayLineChart" class="m-2" style="width:890px; height:290px;" />