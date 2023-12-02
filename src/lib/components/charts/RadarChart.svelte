<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
	import { moodColors } from '$lib/constants/index.js';

	export let elementID;
	export let style;
	export let indicator;
	export let data;

	let radarChart;

	console.log(indicator)

	onMount(() => {
		radarChart = echarts.init(document.getElementById(elementID));

		radarChart?.setOption({
			legend: {
				data: data?.map((item) => item.name),
				top: 20,
				left: 0,
				itemWidth: 13.5,
				orient: 'vertical',
				textStyle: {
					fontSize: 9
				}
			},
			textStyle: {
				fontFamily: "Inter"
			},
			radar: {
				shape: 'circle',
				indicator: indicator,
				axisName: {
					color: 'rgba(54, 54, 54, 1)'
				},
				splitLine: {
					show: true
				},
				axisNameGap: 10,
				scale: true,
				axisLabel: {
					show: true,
      		showMaxLabel: true,
      		color: "rgba(215, 215, 215, 1)"
				}
			},
			series: [
				{
					name: 'Moods',
					type: 'radar',
					data: data,
					symbol: 'none',
					areaStyle: {
						opacity: 0.4
					},
					emphasis: {
						focus: 'self'
					},
					itemStyle: {
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
					// no dataZoom since di jud siya ga work sa radar charts.
					dataView: { show: true, readOnly: false },
					saveAsImage: { show: true }
				}
			}
		});

		return () => {
			radarChart?.dispose();
		};
	});

	afterUpdate(() => {
		radarChart?.setOption({
			legend: {
				data: data?.map((item) => item.name)
			},
			series: [
				{
					data: data
				}
			]
		});
	});
</script>

<div id={elementID} {style} />
