<script>
	// @ts-nocheck
	import { minBy } from 'lodash';
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
  import { moodLabels, moodScores } from "$lib/constants/index.js"

	export let xData;
	export let yData;
	export let style;
  export let title;
  export let elementID;

	let lineChart;
	let mood;
  let showSymbol = false;

	function getNearestMoodLabel(score) {
		const nearestIndex = minBy(moodScores, (moodScore) => Math.abs(moodScore - score));
		return moodLabels[moodScores.indexOf(nearestIndex)];
	}

	$: mood = yData.map((score) => getNearestMoodLabel(score));
  $: mood.length != 1 ? showSymbol = false : showSymbol = true;

	onMount(() => {
		lineChart = echarts.init(document.getElementById(elementID));

		lineChart.setOption({
			title: {
				text: title,
				itemGap: 12,
				subtext:
					'Sad (-4), Annoyed (-3), Nervous (-2), Bored (-1), Neutral (0), Calm (1), Relaxed (2), Happy (3), Excited (4)',
				subtextStyle: {
					fontSize: 11
				}
			},
			xAxis: [{
				type: 'category',
				data: xData,
				axisLine: {
					onZero: false
				},
        boundaryGap: false,
			}],
			yAxis: [{
        splitLine: {
          show: true
        },
				type: 'value',
        boundaryGap: [0, '100%']
      }],
			series: [
				{
					data: yData,
					type: 'line',
          sampling: 'lttb',
          showSymbol: showSymbol
				}
			],
			tooltip: {
				show: true,
				trigger: 'axis',
				formatter: (params) => {
					const index = params[0].dataIndex;
          const temp = xData[index];
					const moodScore = yData[index].toFixed(2);
					const moodLabel = mood[index];
					return `<span class="font-bold">[${temp}]</span> Mood: <span class="font-bold">${moodLabel}</span> (${moodScore})`;
				}
			},
      dataZoom: [
        {
          realtime: true,
          start: 0,
          end: 1000
        }
      ],
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
					saveAsImage: {
						show: true
					}
				}
			}
		});

		return () => {
			lineChart.dispose();
		};
	});

	afterUpdate(() => {  
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

<div id={elementID} {style} />