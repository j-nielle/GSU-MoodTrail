<script>
  // @ts-nocheck
	import _ from 'lodash';
  import { enhance } from '$app/forms';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
    Label, 
    Input,
    Helper,
    Button,
		P,
		Select,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Search, 
    Modal,
    FloatingLabelInput
	} from 'flowbite-svelte';
  import { yearLvl, buttonState } from '$lib/constants/index.js'
  import { InputHelper } from '$lib/components/elements/index.js';
  import { AnnotationSolid, ChevronLeftSolid, ChevronRightSolid } from 'flowbite-svelte-icons'

  export let data;
  export let form;

  $: ({ supabase } = data);

  let studentsData = data.students;

  let searchTerm = '';
  let filteredItems;
  let currentPage = 1;
  let limit = 5;
  let maxPage,startIndex, endIndex, paginatedItems;

  const uniqueCourseIds = Object.keys(
    studentsData.reduce((acc, item) => {
      acc[item.course_id] = true;
      return acc;
    }, {})
  );

  const selectCourse = uniqueCourseIds.map((id) => ({
    value: id,
    name: id
  }));


  const year_levels = Object.keys(yearLvl).map(key => ({
    value: yearLvl[key],
    name: yearLvl[key]
  }));

  let addStudentModal = false;

  onMount(() => {
    const studentsDataChannel = supabase.channel('schema-db-changes')
        .on('postgres_changes',{
          event: '*',
          schema: 'public',
          table: 'Student'
        },(payload) => {
          console.log(payload.eventType)
          if(payload.eventType === 'INSERT'){
            studentsData = _.cloneDeep([payload.new,...studentsData]);
          }else if(payload.eventType === 'UPDATE'){
            // payload.new returns updated row
            // payload.old returns property "id" of updated row
            /**
             * try{
             *  const { data, error } = supabase
                .from('Student')
                .update({ other_column: 'otherValue' })
                .eq('some_column', 'someValue')
                .select()
             * }catch(error){
                console.log(error)
             * }
            */
          }else{
            // payload.old returns property "id" of deleted row
            /**
             * try{
             *  const { error } = await supabase
                  .from('Student')
                  .delete()
                  .eq('some_column', 'someValue')
             * }catch(error){
                console.log(error)
              }
            */
          }
        }
      ).subscribe((status) => console.log($page.url.pathname, status));

    return () => {
      studentsDataChannel.unsubscribe();
    };
  });

  $: {
    startIndex = (currentPage - 1) * limit;
    endIndex = startIndex + limit;
    maxPage = Math.ceil(filteredItems.length / limit);
    paginatedItems = filteredItems.slice(startIndex, endIndex);
  }

  $: {
    filteredItems = studentsData.filter((req) => {
      const idMatch = req.id.toString().includes(searchTerm);
      const nameMatch = req.name.toLowerCase().includes(searchTerm.toLowerCase());
      const courseMatch = req.course_id.toLowerCase().includes(searchTerm.toLowerCase());
      const yearLevelMatch = req.year_level_id.toString().toLowerCase().includes(searchTerm.toLowerCase());

      return (searchTerm !== '')  ? 
        (idMatch || nameMatch || courseMatch || yearLevelMatch)
        : true;
    });
  }

  function changePage(newPage) {
    if (newPage >= 1 && newPage <= maxPage) {
      currentPage = newPage;
    }
  }

  $: console.log(form)
</script>

<svelte:head>
	<title>Student List</title>
</svelte:head>

<div class="bg-white space-y-3 mt-5">

	<div class="flex justify-between">
    <div class="space-x-3 flex flex-row">
      <div class="flex gap-2 ml-8">
        <Search size="md" class="w-96 h-11 bg-white" placeholder="Search by ID, Name, Year Level, Course" bind:value={searchTerm} />
      </div>
    </div>
    <Button class="h-11 mr-7" size="sm" color="green" on:click={() => { addStudentModal = true; }}>Add New Student</Button>
	</div>

	<div class="ml-4-6 ml-4 mb-7 mr-11">
    <div class="flex justify-between ml-4">
      <P class="text-lg mt-3 font-bold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800 mb-6">
        List of All Students
        <p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
          Blah blah blah
        </p>
      </P>
      {#if maxPage > 1}
        <div class="flex flex-row items-center justify-center space-x-2">
            <div class="flex text-sm text-center text-gray-700 dark:text-gray-400">
              <span class="font-semibold text-gray-900 dark:text-white">{currentPage} <span class="font-normal">of</span> {maxPage}</span>
            </div>
            <div class="flex space-x-2">
              <ChevronLeftSolid class="cursor-pointer focus:outline-0" on:click={() => changePage(currentPage - 1)} />
              <ChevronRightSolid class="cursor-pointer focus:outline-0" on:click={() => changePage(currentPage + 1)} />
            </div>
        </div>
      {/if}
    </div>

		<Table divClass="w-full text-left text-sm text-gray-500 dark:text-gray-400 ml-4">
			<TableHead class="border border-zinc-300 text-center">
				<TableHeadCell>Student ID</TableHeadCell>
				<TableHeadCell>Full Name</TableHeadCell>
				<TableHeadCell>Year Level</TableHeadCell>
				<TableHeadCell>Course</TableHeadCell>
        <TableHeadCell>Notes [?]</TableHeadCell>
			</TableHead>
			<TableBody tableBodyClass="divide-y border border-zinc-300 max-h-40 overflow-y-auto">
				{#if paginatedItems === undefined || paginatedItems?.length === 0}
					<TableBodyRow>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
						<TableBodyCell>No data</TableBodyCell>
					</TableBodyRow>
				{:else}
					{#each paginatedItems as student}
						<TableBodyRow class="text-center">
							<TableBodyCell>
                <a class="hover:underline" href="/dashboard/student-chart?search={student.id}" rel="noopener noreferrer">
                  {student.id}
                </a>
              </TableBodyCell>
							<TableBodyCell>{student.name}</TableBodyCell>
							<TableBodyCell>{yearLvl[student.year_level_id]}</TableBodyCell>
              <TableBodyCell>{student.course_id}</TableBodyCell>
              <TableBodyCell class="flex justify-center">
                <AnnotationSolid />
              </TableBodyCell>
						</TableBodyRow>
					{/each}
				{/if}
			</TableBody>
		</Table>
    
	</div>
</div>

<Modal title="Add New Student" bind:open={addStudentModal} size="xs" autoclose={false} class="w-full">
  <form class="flex flex-col" method="POST" action="?/addStudent" use:enhance>

    <div class="mb-2">
      <FloatingLabelInput size="small" style="outlined" name="addID" type="text" label="Student ID" required />
    </div>
    {#if form?.errors}
      {#each form?.errors as error}
        {#if error.errorInput === 'addID'}
          <InputHelper color="red" msg={error.error} />
        {/if}
      {/each}
    {/if}

    <div class="my-2 space-x-4 flex">
      <FloatingLabelInput size="small" style="outlined" name="addFName" type="text" label="First Name" required />
      <FloatingLabelInput size="small" style="outlined" name="addMName" type="text" label="Middle Initial" maxlength="1" required />
      <FloatingLabelInput size="small" style="outlined" name="addLName" type="text" label="Last Name" required />
    </div>
    {#if form?.errors}
      {#each form?.errors as error}
        {#if error.errorInput === 'newName'}
          <InputHelper color="red" msg={error.error} />
        {/if}
      {/each}
    {/if}

    <Select size="sm" items={selectCourse} class="my-2" placeholder="Select Course" name="addCourse" required />

    <div class="flex flex-row space-x-3 my-2 justify-between">
      {#each Object.keys(yearLvl) as key}
        <input type="radio" name="addYrLvl" value={key} title={yearLvl[key]} placeholder="Select Year" required>
        <label class="text-sm" for="addYrLvl">{yearLvl[key]}</label>
      {/each}
    </div>

    <Button type="submit" class="w-full mt-3">Save New Student</Button>

  </form>
</Modal>