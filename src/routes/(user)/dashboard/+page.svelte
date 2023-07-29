<script>
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import MonthlyLineChart from '$lib/components/charts/MonthlyLineChart.svelte';

	export let data;

	let studentMoodData;
	let monthlyAverages;
	let m_scores;
	let timestamps;
	let monthly;

	const currentDate = dayjs();
  const monthlyAveragesObj = {};

	onMount(() => {
		const dashboardChannel = supabase
			.channel('dashboard')
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'StudentMoodEntries'
				},
				(payload) => {
					studentMoodData = [payload.new, ...studentMoodData];
				}
			)
			.subscribe((status) => console.log('/dashboard/+page.svelte:', status));

		return () => {
			dashboardChannel.unsubscribe();
		};
	});

	$: ({ supabase } = data);
	$: studentMoodData = data.studentMood;

	$: {
		m_scores = studentMoodData.map((entry) => entry.mood_score);
		timestamps = studentMoodData.map((entry) => entry.created_at);
	}

	$: {   
    studentMoodData.forEach((entry) => {
        const date = dayjs(entry.created_at);
        if (date.year() === currentDate.year() && date.month() === currentDate.month()) {
            const formattedDate = date.format('MM-DD-YYYY');
            if (entry.mood_score !== undefined && entry.mood_score !== null) {
                if (!monthlyAveragesObj[formattedDate]) {
                    monthlyAveragesObj[formattedDate] = {
                        totalScore: entry.mood_score,
                        count: 1,
                    };
                } else {
                    monthlyAveragesObj[formattedDate].totalScore += entry.mood_score;
                    monthlyAveragesObj[formattedDate].count++;
                }
            }
        }
    });

    monthly = Object.keys(monthlyAveragesObj).sort();
    monthlyAverages = monthly.map((date) => {
        const { totalScore, count } = monthlyAveragesObj[date];
        return totalScore / count;
    });
	}
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>

<div class="p-10">
	<MonthlyLineChart bind:xData={monthly} bind:yData={monthlyAverages} />
</div>
