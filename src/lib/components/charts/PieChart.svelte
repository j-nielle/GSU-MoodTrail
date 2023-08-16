<script>
	// @ts-nocheck
	import * as echarts from 'echarts';
	import { onMount, afterUpdate } from 'svelte';
  import { moodColors } from '$lib/etc/index.js'

	export let data;
  export let elementID;

	let pieChart;

	onMount(() => {
		pieChart = echarts.init(document.getElementById(elementID));

		pieChart.setOption({
			title: {
				text: 'Test'
			},
			series: [{
        data: data,
        type: 'pie',
        radius: '50%',
        itemStyle: {
          color: function(params) {
            return moodColors[params.name] || '#5470c6';
          }
        }
      }],
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
			pieChart.dispose();
		};
	});

	afterUpdate(() => {
		pieChart.setOption({
			series: [{
        data: data
      }]
		});
	});
</script>

<div id={elementID} style="width:390px; height:350px;" />
