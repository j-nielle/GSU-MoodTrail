<script>
	// @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { Card, Button, ButtonGroup, Select, Label } from 'flowbite-svelte';

	export let data;
	let studentMoodData = data.studentMood;

  $: ({ supabase } = data);

  let course;
  let filteredYearLevels;
  let filteredStudentNames;

  let selectedCourse;
  let selectedYearLevel;
  let selectedStudentName;

  let studentInfo;

  $: {
    course = _.uniq(studentMoodData.map((data) => data.course)).map((course) => ({ value: course, name: course }));

    filteredYearLevels = _.chain(studentMoodData)
    .filter({ course: selectedCourse })
    .map('year_level')
    .uniq()
    .sort()
    .map((yearLevel) => ({ value: yearLevel, name: yearLevel }))
    .value();

    filteredStudentNames = _.chain(studentMoodData)
    .filter({ course: selectedCourse, year_level: selectedYearLevel })
    .map('name')
    .uniq()
    .sort()
    .map((name) => ({ value: name, name: name }))
    .value();
  }
  function handleCourseSelection(event) {
    selectedCourse = event.target.value;
    selectedYearLevel = null;
    selectedStudentName = null;
  }

  function handleYearLevelSelection(event) {
    selectedYearLevel = event.target.value;
    selectedStudentName = null;
  }

  function handleStudentNameSelection(event) {
    selectedStudentName = event.target.value;
    studentInfo = _.filter(studentMoodData, { name: selectedStudentName });
    console.log(selectedStudentName,studentInfo)
  }

	onMount(() => {
		const dashboardChannel = supabase
			.channel('dashboard')
			.on(
				'postgres_changes',
				{
					event: 'INSERT',
					schema: 'public',
					table: 'StudentMoodEntries'
				},
				(payload) => {
					studentMoodData = _.cloneDeep([...studentMoodData, payload.new]);
				}
			)
			.subscribe((status) => console.log('/dashboard/student-chart/+page.svelte:', status));

		return () => {
			dashboardChannel.unsubscribe();
		};
	});
</script>

<svelte:head>
	<title>Student Chart</title>
</svelte:head>

<div class="bg-slate-900 p-4 flex space-x-3">
	<Card class="space-y-3 w-fit">
    <Label class="font-bold w-56">Select a course:
      <Select placeholder="..." class="mt-2 font-normal" items={course} bind:value={selectedCourse} on:change={handleCourseSelection} />
    </Label>
    <Label class="font-bold w-56">Select a year level:
      <Select placeholder="..." class="mt-2 font-normal" items={filteredYearLevels} bind:value={selectedYearLevel} on:change={handleYearLevelSelection} />
    </Label>
    <Label class="font-bold w-56">Select a name:
      <Select placeholder="..." class="mt-2 font-normal" items={filteredStudentNames} bind:value={selectedStudentName} on:change={handleStudentNameSelection} />
    </Label>
    <!-- {#if selectedCourse}
      <Label class="font-bold w-56">Select a year level:
        <Select placeholder="..." class="mt-2 font-normal" items={filteredYearLevels} bind:value={selectedYearLevel} on:change={handleYearLevelSelection} />
      </Label>
    {/if}

    {#if selectedYearLevel}
      <Label class="font-bold w-56">Select a name:
        <Select placeholder="..." class="mt-2 font-normal" items={filteredStudentNames} bind:value={selectedStudentName} on:change={handleStudentNameSelection} />
      </Label>
    {/if} -->
  </Card>
	<Card />
</div>
