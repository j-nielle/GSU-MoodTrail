<script>
	// @ts-nocheck
	import _ from 'lodash';
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let title;
	export let heatmapData;
	export let elementID;
	export let style;

	// Define the days and hours for the axis labels
	var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];

	// creates an array of hours from 1-12 and appends AM or PM
	var hours = Array.from({ length: 24 }, (_, i) => {
		const hour = i % 12 === 0 ? 12 : i % 12;
		const period = i < 12 ? 'AM' : 'PM';
		return `${hour} ${period}`;
	});

	let heatmapChart;

	onMount(() => {
		heatmapChart = echarts?.init(document.getElementById(elementID));

		heatmapChart?.setOption({
			tooltip: {
				position: 'top',
				formatter: (params) => {
					return 'Total Moods: ' + params.value[2];
				}
			},
			grid: {
				height: '55%',
			},
			title: {
				text: title
			},
			xAxis: {
				type: 'category',
				data: hours,
				alignTicks: true,
				splitArea: {
					show: true
				}
			},
			yAxis: {
				type: 'category',
				data: days,
				splitArea: {
					show: true
				}
			},
			visualMap: {
				min: 0,
				max: 10,
				realtime: true,
				calculable: true,
				orient: 'horizontal',
				left: 'center',
				bottom: '0'
			},
			series: [
				{
					type: 'heatmap',
					data: heatmapData || [],
					label: {
						show: true
					},
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}
			],
			toolbox: {
				show: true,
				feature: {
					dataZoom: {
						show: true,
						yAxisIndex: 'none'
					},
					saveAsImage: {
						show: true
					}
				}
			}
		});

		return () => {
			heatmapChart?.dispose();
		};
	});

	afterUpdate(() => {
		heatmapChart?.setOption({
			xAxis: {
				data: hours
			},
			yAxis: {
				data: days
			},
			series: [
				{
					data: heatmapData
				}
			]
		});
	});
</script>

<div id={elementID} {style} />
