<script>
	import { onMount } from 'svelte';
	import { newRequest } from '$lib/newRequest';
	import { Alert } from 'flowbite-svelte';
	import { BellRingSolid, CloseSolid } from 'flowbite-svelte-icons';
  import { consistentLowMoods } from '$lib/moodNotify.js';
	
	export let data

  let newLowMoodData = false;
  let notificationText = '';
  let consistentStreaksInfo = new Map();
  const students = []

	$: ({ supabase } = data);

	onMount(() => {
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

  newRequest.set(false);
</script>

<div class="items-center">
	{#if $newRequest}
    <Alert color="blue" class="flex m-5 justify-between items-center content-center">
      <BellRingSolid class="text-blue-700" />
      <div>
        <span class="font-bold text-blue-700">(NEW)</span> Help request received!
      </div>
      <CloseSolid class="cursor-pointer w-4 h-4 text-blue-500 hover:text-blue-700" on:click={() => newRequest.update(() => false)} />
    </Alert>
  {:else if newLowMoodData}
    <Alert color="red" class="flex m-5 justify-between items-center content-center">
      <BellRingSolid class="text-red-700" />
      <div class="text-center">
        Click <a href="/dashboard"><span class="font-bold hover:underline">here</span></a> to view the list of students experiencing consistent low moods for atleast 4 consecutive days.
      </div>
      <CloseSolid class="cursor-pointer w-4 h-4 text-red-500 hover:text-red-700" on:click={() => newLowMoodData = false} />
    </Alert>
	{/if}
	<slot />
</div>
