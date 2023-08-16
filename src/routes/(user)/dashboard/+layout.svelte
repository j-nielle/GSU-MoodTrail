<script>
	import { onMount } from 'svelte';
  import { page } from '$app/stores';
	import { Alert } from 'flowbite-svelte';
	import { BellRingSolid, CloseSolid } from 'flowbite-svelte-icons';
  import { consistentLowMoods, focusTable, newRequest } from '$lib/stores/index.js';
	
	export let data

  let newLowMoodData = false;
  let notificationText = '';
  let consistentStreaksInfo = new Map();
  const students = []

	$: ({ supabase } = data);

	onMount(() => {
    newRequest.set(false);
    focusTable.set(false);

    const toastChannel = supabase
			.channel('toast-requests')
			.on('postgres_changes', {
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				},(payload) => {
					if (payload.new) {
						newRequest.update(() => true)
						setTimeout(() => {
							newRequest.update(() => false)
						}, 5000);
					}
				}
			).subscribe((status) => console.log("inside dashboard layout",status));
	
      const unsubscribe = consistentLowMoods.subscribe(updatedMoods => {
        updatedMoods.forEach(moodEntry => {
          const studentId = moodEntry.studentId;
          const streaksLength = moodEntry.streaks.length;

          if (!students.includes(studentId)) {
            students.push(studentId);
          }

          if (consistentStreaksInfo.has(studentId)) {
            if (streaksLength !== consistentStreaksInfo.get(studentId).streaksLength) {
              newLowMoodData = true;
              notificationText += `New low mood streaks for student ${studentId}`;
              console.log('new streaks for student', studentId)
            }
          } else {
            newLowMoodData = true;
            notificationText += `Low mood streak for student ${studentId}`;
            console.log('Low mood streak for student', studentId)
          }

          consistentStreaksInfo.set(studentId, { streaksLength });
        });
      });
		return () => {
			toastChannel.unsubscribe();
      unsubscribe();
		}
	});

  $: if(activeUrl != '/dashboard') {
    focusTable.update(()=>false)
  }

  $: activeUrl = $page.url.pathname;
</script>

<div class="bg-zinc-50 items-center">
	<div class="px-4 pt-4">
    {#if $newRequest}
    <Alert class="bg-blue-100 text-blue-900 flex justify-between items-center content-center">
      <BellRingSolid tabindex="-1" class="text-blue-700" />
      <div>
        <span class="font-bold text-blue-700">(NEW)</span> Help request received!
      </div>
      <CloseSolid tabindex="-1" class="cursor-pointer w-4 h-4 text-blue-500 hover:text-blue-700" on:click={() => newRequest.update(() => false)} />
    </Alert>
  {:else if newLowMoodData}
    <Alert class="bg-red-200 flex justify-between items-center content-center text-red-900">
      <BellRingSolid tabindex="-1" class="text-red-700" />
      {#if activeUrl != '/dashboard'}
      <div class="text-center">
        Go to dashboard to view the list of students experiencing consistent low moods for atleast 4 consecutive days.
      </div>
      {:else}
      <div class="text-center">
        Click <span role="button" tabindex="0" class="font-bold hover:underline" on:click={() => focusTable.update(()=>true)} on:keypress={() => focusTable.update(()=>true)}>here</span> to view the list of students experiencing consistent low moods for atleast 4 consecutive days.
      </div>
      {/if}
      <CloseSolid tabindex="-1" class="cursor-pointer w-4 h-4 text-red-500 hover:text-red-700" on:click={() => newLowMoodData = false} />
    </Alert>
	{/if}
  </div>
	<slot />
</div>
