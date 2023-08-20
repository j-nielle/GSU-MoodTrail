<script>
	// @ts-nocheck
	import { minBy } from 'lodash';
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let xData;
	export let yData;
  export let elementID;

	let overallLC;
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
		overallLC = echarts.init(document.getElementById(elementID));

		overallLC.setOption({
			title: {
				text: 'Overall Mood Averages',
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
				type: 'value',
			},
			series: [
				{
					data: yData,
					type: 'line'
				}
			],
      dataZoom: [
        {
          start: 0,
          end: 20
        }
      ],
			tooltip: {
				show: 'true',
				trigger: 'axis',
				formatter: (params) => {
					const index = params[0].dataIndex;
          const date = xData[index];
					const moodScore = yData[index].toFixed(2);
					const moodLabel = mood[index];
					return `${date}: <span class="font-bold">${moodLabel}</ span>`;
				},
        axisPointer: {
          animation: false
        }
			},
			toolbox: {
				show: true,
				feature: {
					dataZoom: {
						show: true,
            realtime: true,
						yAxisIndex: 'none'
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
			overallLC.dispose();
		};
	});

	afterUpdate(() => {
		overallLC.setOption({
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

<div id={elementID} style="width:790px; height:280px;" />