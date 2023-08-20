<script>
	// @ts-nocheck
  import _ from 'lodash';
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let heatmapData;
  export let elementID;

  // Define the days and hours for the axis labels
  var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  var hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 === 0 ? 12 : i % 12;
    const period = i < 12 ? 'AM' : 'PM';
    return `${hour} ${period}`;
  });


	let heatmapChart;

	onMount(() => {
		heatmapChart = echarts.init(document.getElementById(elementID));

		heatmapChart.setOption({
      tooltip: {
        position: 'top',
        formatter: function (params) {
          return 'Total Moods: ' + params.value[2]
        },
      },
			title: {
				text: 'Mood Occurrences by Day and Hour'
			},
      xAxis: {
        type: 'category',
        data: hours,
        alignTicks: true,
      },
      yAxis: {
        type: 'category',
        data: days,
      },
			visualMap: {
				min: 0,
				max: 10,
				realtime: true,
				calculable: true,
				left: 'center',
				orient: 'horizontal',
			},
			series: [{
				type: 'heatmap',
				data: heatmapData || [],
				label: {
					show: true
				},
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowColor: 'rgba(0, 0, 0, 0.5)'
					},
          focus: 'self',
					}
			}],
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

<div id={elementID} style="width:620px; height:350px;" />
