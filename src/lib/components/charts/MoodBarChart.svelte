<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';

	export let xData;
	export let yData;

	let moodBarChart;

  let categoryColors ={
    "Calm": "#7BAEE0",
    "Excited": "#E69743",
    "Relaxed": "#5DDE70",
    "Annoyed": "#DE5DC0",
    "Neutral": "#A6A6A6",
    "Bored": "#91D9D0",
    "Sad": "#8297D1",
    "Happy": "#E0EB1A",
    "Nervous": "#B962DE"
  }

	onMount(() => {
		moodBarChart = echarts.init(document.getElementById('moodBarChart'));

		if (xData.length === 0 || yData.length === 0) {
			moodBarChart.showLoading();
		} else {
			moodBarChart.hideLoading();
		}

		moodBarChart.setOption({
			title: {
				text: 'Overall Mood Counts'
			},
			xAxis: {
				type: 'category',
				data: xData
			},
			yAxis: {
				type: 'value'
			},
			series: [{
        label: {
          show: true,
          rotate: 90,
          //color: 'white',
          formatter: '{b}'
        },
        data: yData,
        type: 'bar',
        itemStyle: {
          realtimeSort: true,
          color: function(params) {
            return categoryColors[params.name] || '#5470c6';
          }
        }
      }],
			tooltip: {
				show: true,
				trigger: 'axis'
			},
			toolbox: {
				show: true,
				feature: {
					dataZoom: {
						show: true,
						yAxisIndex: 'none'
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
			moodBarChart.dispose();
		};
	});

	afterUpdate(() => {
		moodBarChart.setOption({
			xAxis: {
				data: xData
			},
			series: [{
        data: yData
      }]
		});
	});
</script>

<div id="moodBarChart" style="width:410px; height:350px;" />
