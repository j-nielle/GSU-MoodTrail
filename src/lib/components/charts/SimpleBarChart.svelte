<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let xData;
	export let xType;
	export let xName = '';
	export let yData;
	export let yType;
	export let yName = '';
	export let elementID;
	export let style;
	export let title = '';
	export let markType = 'average';
	export let fontSize = '';
	export let yAxisRotate = '';

	let simpleBarChart, currMType;

	$: currMType = markType;

	$: {
			if(xData?.length == 0 || yData?.length == 0){
				simpleBarChart?.showLoading();
			}else {
				simpleBarChart?.hideLoading();
			}
		}

	onMount(() => {
		simpleBarChart = echarts?.init(document?.getElementById(elementID));

		window?.addEventListener('resize', () => {
			simpleBarChart?.resize();
			//console.log('Window resized, bar chart updated.');
		});

		simpleBarChart?.setOption({
			title: {
				text: title,
				textStyle:{
          color: '#000000',
					fontSize: 16,
					fontStyle: "normal",
					fontWeight: 500
        }
			},
			yAxis: {
				type: yType,
				name: yName,
				nameRotate: yAxisRotate,
				nameLocation: 'center',
				nameGap: 23,
				axisLabel: {
					fontSize: 10
				}
			},
			xAxis: {
				type: xType,
				data: xData,
				nameRotate: 0,
				nameLocation: 'center',
				nameGap: 25,
				axisLabel: { show: false },
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
					label: {
						show: true,
						formatter: '{b}',
						borderWidth: 0
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
						yAxisIndex: 'none'
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
			window?.removeEventListener('resize', () => {
				simpleBarChart?.resize();
			});
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
