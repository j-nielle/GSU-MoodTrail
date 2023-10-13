<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
	import { moodColors } from '$lib/constants/index.js';

	export let xData;
	export let yData;
	export let elementID;
	export let style;
	export let title;
	export let markType;

	let simpleBarChart, currMType;

	$: currMType = markType;

	onMount(() => {
		simpleBarChart = echarts?.init(document.getElementById(elementID));

		simpleBarChart?.setOption({
			title: {
				text: title,
				textStyle: {
					color: '#000000'
				}
			},
			yAxis: {
				type: 'value',
				name: 'Frequency',
				nameRotate: 90,
				nameLocation: 'center',
				nameGap: 35,
				axisLabel: {
					fontSize: 10
				}
			},
			xAxis: {
				type: 'category',
				data: xData,
				name: 'Reason',
				nameRotate: 0,
				nameLocation: 'center',
				nameGap: 35,
				axisLabel: {
					fontSize: 10,
					interval: 0
				}
			},
			series: [
				{
					data: yData,
					type: 'bar',
					emphasis: {
						focus: 'self'
					},
					itemStyle: {
						color: '#1a56db'
					},
					markLine: {
						label: {
							show: true,
						},
						lineStyle: {
							color: '#000'
						},
						data: [{
							type: currMType,
						}],
						silent: true
					}
				}
			],
			textStyle: {
				fontFamily: 'Inter'
			},
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				}
			},
			toolbox: {
				show: true,
				feature: {
					dataZoom: {
						show: true,
						xAxisIndex: 'none'
					},
					restore: {
						show: true
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
			simpleBarChart?.dispose();
		};
	});

	afterUpdate(() => {
		simpleBarChart?.setOption({
			xAxis: {
				data: xData
			},
			series: [
				{
					data: yData,
					markLine: {
						data: [{
							type: currMType
						}]
					},
				}
			]
		});
	});
</script>

<div id={elementID} {style} />
