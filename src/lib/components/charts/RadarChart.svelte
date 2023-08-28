<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	//export let data;
	export let elementID;
	export let title;
	export let style;

	let radarChart;

	onMount(() => {
		radarChart = echarts.init(document.getElementById(elementID));

		radarChart.setOption({
			title: {
				text: title
			},
			legend: {
				data: ['Allocated Budget', 'Actual Spending'],
        itemHeight: 9.5
			},
			radar: {
				//shape: 'circle',
				indicator: [
					{ name: 'Sales', max: 6500 },
					{ name: 'Administration', max: 16000 },
					{ name: 'Information Technology', max: 30000 },
					{ name: 'Customer Support', max: 38000 },
					{ name: 'Development', max: 52000 },
					{ name: 'Marketing', max: 25000 }
				],
        axisName: {
          color: "rgba(54, 54, 54, 1)"
        }
			},
			series: [
				{
					name: 'Budget vs spending',
					type: 'radar',
					data: [
						{
							value: [4200, 3000, 20000, 35000, 50000, 18000],
							name: 'Allocated Budget'
						},
						{
							value: [5000, 14000, 28000, 26000, 42000, 21000],
							name: 'Actual Spending'
						}
					]
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
			radarChart.dispose();
		};
	});

	afterUpdate(() => {
		radarChart.setOption({
			series: [
				{
					data: [
						{
							value: [4200, 3000, 20000, 35000, 50000, 18000],
							name: 'Allocated Budget'
						},
						{
							value: [5000, 14000, 28000, 26000, 42000, 21000],
							name: 'Actual Spending'
						}
					]
				}
			]
		});
	});
</script>

<div id={elementID} {style} />
