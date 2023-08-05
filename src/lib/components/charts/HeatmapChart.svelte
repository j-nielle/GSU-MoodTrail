<script>
	// @ts-nocheck
  import _ from 'lodash';
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let heatmapData;

  // Define the days and hours for the axis labels
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var hours = Array.from({ length: 24 }, (_, i) => i); // 

	let heatmapChart;

	onMount(() => {
		heatmapChart = echarts.init(document.getElementById('heatmapChart'));

    if (!heatmapData) {
			heatmapChart.showLoading();
		} else {
			heatmapChart.hideLoading();
		}

		heatmapChart.setOption({
      tooltip: {
        position: 'top'
      },
			title: {
				text: 'Heatmap Chart'
			},
      xAxis: {
        type: 'category',
        data: hours,
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
				left: 'center',
				orient: 'horizontal',
			},
			series: [
				{
					name: 'Test',
					type: 'heatmap',
					data: heatmapData,
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
			heatmapChart.dispose();
		};
	});

	afterUpdate(() => {
		heatmapChart.setOption({
			xAxis: {
				data: hours
			},
      yAxis:{
        data: days
      },
			series: [{
        data: heatmapData
      }]
		});
	});
</script>

<div id="heatmapChart" style="width:750px; height:350px;" />
