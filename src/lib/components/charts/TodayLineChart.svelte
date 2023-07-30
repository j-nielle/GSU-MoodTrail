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
		const moodLabels = ['Sad', 'Annoyed', 'Nervous', 'Bored', 'Neutral', 'Calm', 'Relaxed', 'Happy', 'Excited'];
		const moodScores = [-4, -3, -2, -1, 0, 1, 2, 3, 4];

		const nearestIndex = minBy(moodScores, (moodScore) => Math.abs(moodScore - score));
		return moodLabels[moodScores.indexOf(nearestIndex)];
	}


	onMount(() => {
		mood = yData.map(score => getNearestMoodLabel(score));

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
				name: 'Mood Score',
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
          const moodScore = yData[index].toFixed(4);
          const moodLabel = mood[index];
          return `Mood: ${moodLabel} (<span class="font-bold">${moodScore}</span>)`;
        }
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

<div id="todayLineChart" class="m-2" style="width:970px;height:270px;"/>

