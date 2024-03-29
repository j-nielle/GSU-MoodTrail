<script>
	// @ts-nocheck
	import _ from 'lodash';
	import * as echarts from 'echarts';
  import ecStat from 'echarts-stat';
	import { onMount, afterUpdate } from 'svelte';

  export let data;
	export let elementID;
	export let style;
  export let title;

	let histogramChart;
  let transformedData;

  $: transformedData = data?.map(function (item) {
    // returns an array with x as the login hour and y as the mood score
    return [new Date(item.created_at).getHours(), item.mood_score];
  });

	onMount(() => {
    echarts?.registerTransform(ecStat.transform.histogram);
		histogramChart = echarts?.init(document?.getElementById(elementID));

    window?.addEventListener('resize', () => {
			histogramChart?.resize();
			//console.log('Window resized, histogram chart updated.');
		});

		histogramChart?.setOption({
			tooltip: {
				position: 'top'
			},
      title: {
        text: title,
        textStyle:{
          color: '#000000',
					fontSize: 16,
					fontStyle: "normal",
					fontWeight: 500
        },
      },
			dataset: [
        {
          source: transformedData
        },
        {
          transform: {
            type: 'ecStat:histogram',
            config: {}
          }
        }
      ],
      tooltip: {
        
      },
      xAxis: { 
        name: "Hour", 
        type: 'category', 
        scale: true,
				axisLabel: {
					fontSize: 10,
    			interval: 0 
				},
        nameRotate: 90,
        nameGap: 10 
      },
      yAxis: { 
        name: "Frequency",
        nameRotate: 90,
        nameLocation: "middle",
        nameGap: 25
      },
			textStyle: {
				fontFamily: "Inter"
			},
      series: [ // each bar in the histogram represents a range of login hours
        { // height of the bar corresponds to the frequency of moods observed within that range
          name: 'Moods',
          type: 'bar', 
          barWidth: '99.3%',
          label: {
            show: true,
            position: 'top'
          },
          // 1st dimension (0, hour) of the data will be mapped to the x-axis
          // second dimension (1, mood_score) will be mapped to the y-axis
          encode: { x: 0, y: 1 },
          // 1 means that this series will use the second dataset in the array (since indexing starts at 0).
          datasetIndex: 1,
          itemStyle: {
            color: '#1a56db'
          }
        }
      ],
      dataZoom: [{ type: 'slider', height: 20 }],
			toolbox: {
				show: true,
				feature: {
					dataZoom: {
						show: true,
            yAxisIndex: true
					},
          dataView: { show: true, readOnly: false },
          restore: {
            show: true
          },
					saveAsImage: {
						show: true
					}
				}
			}
		});

		return () => {
      window?.removeEventListener('resize', () => {
				histogramChart?.resize();
			});
			histogramChart?.dispose();
		};
	});

	afterUpdate(() => {
		histogramChart?.setOption({
      dataset: [
        {
          source: transformedData
        }
      ],
		});
	});
</script>

<div id={elementID} {style} />
