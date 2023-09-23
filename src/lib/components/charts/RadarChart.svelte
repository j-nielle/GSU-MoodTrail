<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
	import { moodLabels, moodColors } from '$lib/constants/index.js';

	export let elementID;
	export let style;
	export let indicator;
	export let data;

	let radarChart;

	onMount(() => {
		radarChart = echarts.init(document.getElementById(elementID));

		radarChart.setOption({
			legend: {
				data: moodLabels,
				top: 20,
				left: 0,
				itemWidth: 13.5,
				orient: 'vertical',
				textStyle: {
					fontSize: 9
				}
			},
			radar: {
				//shape: 'circle',
				indicator: indicator,
				axisName: {
					color: 'rgba(54, 54, 54, 1)'
				},
				axisTick: {
					//show: true,
				},
				axisLabel: {
					//show:true,
				},
				splitLine: {
					show: true
				},
				axisNameGap: 10,
				scale: true
				// splitLine: {
				//   lineStyle: {
				//     color: [
				//       'rgba(238, 197, 102, 0.1)',
				//       'rgba(238, 197, 102, 0.2)',
				//       'rgba(238, 197, 102, 0.4)',
				//       'rgba(238, 197, 102, 0.6)',
				//       'rgba(238, 197, 102, 0.8)',
				//       'rgba(238, 197, 102, 1)'
				//     ].reverse()
				//   }
				// },
				// splitArea: {
				//   show: false
				// },
				// axisLine: {
				//   lineStyle: {
				//     color: 'rgba(238, 197, 102, 0.5)'
				//   }
				// }
			},
			series: [
				{
					name: 'Moods',
					type: 'radar',
					data: data,
					symbol: 'none',
					areaStyle: {
						opacity: 0.5
					},
					emphasis: {
						focus: 'self'
						//blurScope: 'global'
					},
					itemStyle: {
						//opacity: 0.1,
						color: function (params) {
							return moodColors[params.name] || '#5470c6';
						}
					}
				}
			],
			tooltip: {
				show: true,
				trigger: 'item'
			},
			toolbox: {
				show: true,
				feature: {
					dataView: { show: true, readOnly: false },
					saveAsImage: { show: true }
				}
			}
		});

		return () => {
			radarChart.dispose();
		};
	});

	afterUpdate(() => {
		radarChart.setOption({
			series: [
				{
					data: data
				}
			]
		});
	});
</script>

<div id={elementID} {style} />
