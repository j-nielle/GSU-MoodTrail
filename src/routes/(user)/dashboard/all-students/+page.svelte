<script>
  // @ts-nocheck
	import _ from 'lodash';
	import dayjs from 'dayjs';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		PaginationItem,
    Button,
		Checkbox,
		Input,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		Search,
    Select
	} from 'flowbite-svelte';
  import { yearLvl } from '$lib/constants/index.js'
  import { AnnotationSolid } from 'flowbite-svelte-icons'

  export let data;

  $: ({ supabase } = data);

  let studentsData = data.students;

  let searchTerm = '';
  let course;
	let yearLevel;

	let selectedCourse;
	let selectedYearLevel;

  let currentPage = 1;
  let limit = 5;
  let maxPage,startIndex, endIndex, paginatedItems;

  let filteredItems;

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
    maxPage = Math.ceil(studentsData.length / limit);
    paginatedItems = filteredItems.slice(startIndex, endIndex);
  }

  $: {
    filteredItems = studentsData.filter((req) => {
      const idMatch = req.id.includes(searchTerm);
      const nameMatch = req.name.toLowerCase().includes(searchTerm.toLowerCase());
      const courseMatch = req.course_id.toLowerCase().includes(searchTerm.toLowerCase());
      const yearLevelMatch = req.year_level_id.toString().toLowerCase().includes(searchTerm.toLowerCase());

      return (searchTerm !== '')  ? 
        (idMatch || nameMatch || courseMatch || yearLevelMatch)
        : true;
    });
    console.log(filteredItems)
  }

  function changePage(newPage) {
    if (newPage >= 1 && newPage <= maxPage) {
      currentPage = newPage;
    }
  }
</script>

<svelte:head>
	<title>Student List</title>
</svelte:head>

<div class="bg-white space-y-3 mt-5">
	<div class="flex justify-between">
    <div class="space-x-4 flex flex-row max-w-full items-end">
      <div class="flex gap-2 ml-8">
        <Search size="md" class="w-fit h-11 bg-white" placeholder="Search by ID or name" bind:value={searchTerm} />
      </div>
  
      <Button class="h-11" size="sm" color="red" on:click={() => { searchTerm = ''; }}>
        Reset
      </Button>
    </div>
	</div>
	<div class="ml-4-6 ml-4 mb-7 mr-11">
		<Table divClass="w-full text-left text-sm text-gray-500 dark:text-gray-400 ml-4">
			<caption class="text-lg mt-3 font-bold text-left text-gray-900 bg-white dark:text-white dark:bg-gray-800 mb-6">
				List of All Students
				<p class="mt-1 text-sm font-normal text-gray-500 dark:text-gray-400">
					Blah blah blah
				</p>
			</caption>
			<TableHead class="border border-zinc-300 text-center">
				<TableHeadCell>Student ID</TableHeadCell>
				<TableHeadCell>Full Name</TableHeadCell>
				<TableHeadCell>Year Level</TableHeadCell>
				<TableHeadCell>Course</TableHeadCell>
        <TableHeadCell>Notes</TableHeadCell>
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
    <div class="flex flex-col items-center justify-center space-y-2 mt-2">
      {#if maxPage > 1}
        <div class="flex text-sm text-center text-gray-700 dark:text-gray-400">
          <span class="font-semibold text-gray-900 dark:text-white">{currentPage} <span class="font-normal">of</span> {maxPage}</span>
        </div>
        <div class="flex space-x-1.5">
          <PaginationItem class="bg-slate-900 text-white hover:bg-slate-950 hover:text-white" on:click={() => changePage(currentPage - 1)}>Prev</PaginationItem>
          <PaginationItem class="bg-slate-900 text-white hover:bg-slate-950 hover:text-white" on:click={() => changePage(currentPage + 1)}>Next</PaginationItem>
        </div>
      {/if}
		</div>
	</div>
</div>