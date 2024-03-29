<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
	import { mood, getNearestMoodLabel } from '$lib/constants/index.js';

	export let xData;
	export let yData;
	export let style;
	export let elementID;

	let lineChart;
	let currentMood;
	let showSymbol = false;

	//$: console.log(yData?.length)
	$: currentMood = yData?.map((score) => getNearestMoodLabel(score, mood));
	$: currentMood?.length != 1 ? (showSymbol = false) : (showSymbol = true);

	$: {
		if(xData?.length == 0 || yData?.length == 0){
			lineChart?.showLoading();
		}else {
			lineChart?.hideLoading();
		}
	}

	onMount(() => {
		lineChart = echarts.init(document?.getElementById(elementID));

		window?.addEventListener('resize', () => {
			lineChart?.resize();
			//console.log('Window resized, line chart updated.');
		});

		lineChart?.setOption({
			title: {
				subtext:
					'Sad (-4), Annoyed (-3), Nervous (-2),\nBored (-1), Neutral (0),Calm (1),\nRelaxed (2), Happy (3), Excited (4)',
				subtextStyle: {
					fontSize: 11
				}
			},
			xAxis: [
				{
					type: 'category',
					data: xData,
					axisLine: { onZero: false },
					boundaryGap: false
				}
			],
			yAxis: [
				{
					splitLine: { show: true },
					type: 'value',
					boundaryGap: [0, '100%'],
					nameRotate: 90,
					name: "Mood Score",
					nameLocation: "middle",
					nameGap: 40
				}
			],
			textStyle: {
				fontFamily: "Inter"
			},
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
					const index = params[0]?.dataIndex; // index of the x-axis which is basically the date
					const temp = xData[index]; // the date itself

					let moodScore;
					// for rounding off the mood score
					yData[index].length < 3 ? (moodScore = yData[index]) : (moodScore = yData[index]?.toFixed(2));

					const moodLabel = currentMood[index];
					return `<span class="font-bold">[${temp}]</span> Mood: <span class="font-bold">${moodLabel}</span> (${moodScore})`;
				}
			},
			dataZoom: [{ type: 'slider', height: 20 }],
			toolbox: {
				show: true,
				feature: {
					dataZoom: { show: true, yAxisIndex: 'none' },
          restore: {
            show: true
          },
					dataView: { show: true, readOnly: false },
					saveAsImage: { show: true }
				}
			}
		});

		return () => {
			window?.removeEventListener('resize', () => {
				lineChart?.resize();
			});
			lineChart.dispose();
		};
	});

	afterUpdate(() => {
		lineChart.setOption({
			xAxis: { data: xData },
			series: [{ data: yData }]
		});
	});
</script>

<div id={elementID} {style} />