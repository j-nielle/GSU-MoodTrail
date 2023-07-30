<script>
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { Card, Button, Label } from 'flowbite-svelte';
	import { FaceLaughOutline } from 'flowbite-svelte-icons';
	import MonthlyLineChart from '$lib/components/charts/MonthlyLineChart.svelte';

	export let data;

	let studentMoodData;
	let monthlyAverages;
	let m_scores;
	let timestamps;
	let daily;
	let weekly;
	let monthly;
	let yearly;

	const currentDate = dayjs();
	const dailyAveragesObj = {};
	const weeklyAveragesObj = {};
	const monthlyAveragesObj = {};
	const yearlyAveragesObj = {};

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
			const formattedDate = date.format('MM-DD-YYYY');
			// if the entry was created this year and this month
			// make month an input so that users can choose which month
			// to view in the line chart
			if (entry.mood_score !== undefined && entry.mood_score !== null) {
				if (date.isSame(currentDate, 'month')) {
					if (!monthlyAveragesObj[formattedDate]) {
						monthlyAveragesObj[formattedDate] = {
							totalScore: entry.mood_score,
							count: 1
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

<div class="flex">
	<div class="flex p-3 flex-col justify-start space-y-3">
		<div class="">
			<Card class="w-48 h-10 outline outline-black outline-1 justify-center items">
				<FaceLaughOutline />
			</Card>
		</div>
		<div class="">
			<Card class="w-48 h-10 outline outline-black outline-1 justify-center items-stretch">
				<Label>Testing</Label>
			</Card>
		</div>
	</div>
	<div class="outline outline-lime-500 outline-1 flex">
		<div class="flex flex-col m-3">
			<div class="bg-blue-100 justify-start items-center content-center mb-2 space-x-1">
				<Button class="outline outline-black outline-1" />
				<Button class="outline outline-black outline-1" />
				<Button class="outline outline-black outline-1" />
				<Button class="outline outline-black outline-1" />
			</div>
			<MonthlyLineChart bind:xData={monthly} bind:yData={monthlyAverages} />
		</div>
	</div>
</div>
