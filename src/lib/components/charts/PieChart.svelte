<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
	import { moodColors } from '$lib/constants/index.js';

	export let data;
	export let elementID;
	export let title;

	let pieChart;

	onMount(() => {
		pieChart = echarts.init(document.getElementById(elementID));

		window?.addEventListener('resize', () => {
			pieChart?.resize();
			//console.log('Window resized, pie chart updated.');
		});

		pieChart.setOption({
			title: {
				text: title,
        textStyle:{
          color: '#000000'
        }
			},
			textStyle: {
				fontFamily: "Inter"
			},
			series: [
				{
					data: data,
					type: 'pie',
					radius: '50%',
					emphasis: {
						focus: 'self'
					},
					label: {
						formatter: '{b}: {@2012} ({d}%)'
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
			window?.removeEventListener('resize', () => {
				pieChart?.resize();
			});
			pieChart.dispose();
		};
	});

	afterUpdate(() => {
		pieChart.setOption({
			series: [
				{
					data: data
				}
			]
		});
	});
</script>

<div id={elementID} style="width:490px; height:350px;" />
