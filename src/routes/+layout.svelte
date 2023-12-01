<script>
	// @ts-nocheck
	import '../app.postcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import {
		Alert,
		Avatar,
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		Button,
		Dropdown,
		DropdownDivider,
		//DropdownHeader,
		DropdownItem
	} from 'flowbite-svelte';
	import { ChevronDownOutline, BellRingSolid, CloseSolid } from 'flowbite-svelte-icons';
	import { consistentLowMoods, focusTable, newRequest } from '$lib/stores/index.js';
	import { 
		//logoOg, 
		moodTrailOG 
	} from '$lib/img/index.js';

	export let data;

	const navDivClass = "flex justify-between items-center relative z-20 ml-3.5"
	const activeClass = "text-blue-700 font-semibold"
	const chevronClass = "w-3 h-3 ml-2 text-primary-800 dark:text-white inline focus:outline-0"
	const avatarClass = "cursor-pointer fixed"
	const containerClass = "relative z-30 drop-shadow-lg w-fit mt-8"
	const dropdownItemClass = "relative z-50 py-2 text-sm font-bold text-red-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"

	let newLowMoodData = false;
	let currStudentIDNotif = '';
	let consistentStreaksInfo = new Map();
	const students = [];

	let notifText = '';

	$: ({ supabase, session } = data);
	$: activeUrl = $page.url.pathname;

	onMount(() => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
			console.log(event)
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		const newRequestChannel = supabase.channel('newRequestChannel')
			.on('postgres_changes',{
					event: 'INSERT',
					schema: 'public',
					table: 'Request'
				},(payload) => {
					newRequest.update(() => true);
				}
			).subscribe() // (status) => console.log(activeUrl,status));

		// checks if there’s any new data in the consistentLowMoods store
		// note: only runs when url is /dashboard since that is where the consistentLowMoods store is updated
		const unsubscribe = consistentLowMoods.subscribe((updatedMoods) => {
			updatedMoods.forEach((moodEntry) => {
				const studentId = moodEntry.studentId;
				currStudentIDNotif = studentId;
				const streaksLength = moodEntry.streaks.length;

				// checks if the studentId is already in the students array
				// if not, add the studentId to the array
				if (!students.includes(studentId)) {
					students.push(studentId);
				}

				// checks if the studentId is in the consistentStreaksInfo map
				if (consistentStreaksInfo.has(studentId)) {
					// checks if the streaksLength is different from the streaksLength in the map
          if (streaksLength !== consistentStreaksInfo.get(studentId).streaksLength) {
						// basically, if the streaksLength is different, it means that the student has a new streak
           	newLowMoodData = true;
						notifText = ` has a new low mood streak, `;
            consistentStreaksInfo.set(studentId, { streaksLength }); // updates the streaksLength in the map
          }
        } else { 
					// if the studentId is not in the map, add the studentId and streaksLength to the map
					// basically means that a new student has been added to the consistentLowMoods store
          newLowMoodData = true;
					notifText = ` has been added to the consistent low moods table, `
          consistentStreaksInfo.set(studentId, { streaksLength }); // adds the streaksLength to the map
        }
			});
		});

		return () => {
			subscription.unsubscribe();
			newRequestChannel.unsubscribe();
			unsubscribe();
		}
	});
</script>

<Navbar class="!py-3 drop-shadow-sm w-full relative z-20 print:hidden" {navDivClass}>
	{#if session}
		<NavBrand tabindex="-1" href="/dashboard">
			<img src={moodTrailOG} alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
		
		<NavUl>
			<NavLi href="/dashboard" active={activeUrl === '/dashboard'} {activeClass}>
				Dashboard
			</NavLi>
			<NavLi href="/requests" active={activeUrl === '/requests'} {activeClass}>
				Requests
			</NavLi>
			<NavLi id="student-menu" class="cursor-pointer">
				Students<ChevronDownOutline class={chevronClass} />
			</NavLi>
			<Dropdown triggeredBy="#student-menu" dropdownClass="w-36 items-center relative z-20">
				<DropdownItem href="/students/student-list">Student List</DropdownItem>
				<DropdownItem href="/students/student-mood-information">Student Mood Information</DropdownItem>
			</Dropdown>
		</NavUl>

		<label for="avatar-menu">
			<Avatar class={avatarClass} id="avatar-menu" alt="User Profile Pic" border />
		</label>
		<Dropdown class="relative z-50" placement="left" triggeredBy="#avatar-menu" {containerClass}>
			<DropdownItem class="cursor-pointer" href="/settings/account">SETTINGS</DropdownItem>
			<DropdownDivider />
			<form method="POST" action="/logout">
				<DropdownItem type="submit" class={dropdownItemClass}>LOGOUT</DropdownItem>
			</form>
		</Dropdown>
	{:else}
		<NavBrand tabindex="-1" href="/">
			<img src={moodTrailOG} alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
		
		{#if activeUrl != '/login'}
			<Button href="/login" color="purple" class="mr-3 font-semibold tracking-wide">LOGIN</Button>
		{:else}
			<Button disabled href="/login" color="purple" class="mr-3 font-semibold tracking-wide pointer-events-none">LOGIN</Button>
		{/if}
	{/if}
</Navbar>
<!-- fix this: <Layout> received an unexpected slot "default" -->
<main>
	{#if $newRequest}
		{#if activeUrl == '/dashboard'}
			<div class="px-4 pt-4 bg-zinc-100">
				<Alert class="bg-blue-100 text-blue-900 flex justify-between items-center content-center">
					<BellRingSolid tabindex="-1" class="text-blue-700" />
					<div>
						<span class="font-bold text-blue-700">(NEW)</span> Help request received!
					</div>
					<CloseSolid tabindex="-1" class="cursor-pointer w-4 h-4 text-blue-500 hover:text-blue-700 focus:outline-none" on:click={() => newRequest.update(() => false)} />
				</Alert>
			</div>
		{:else}
			<div class="px-4 pt-4">
				<Alert class="bg-blue-100 text-blue-900 flex justify-between items-center content-center">
					<BellRingSolid tabindex="-1" class="text-blue-700" />
					<div>
						<span class="font-bold text-blue-700">(NEW)</span> Help request received!
					</div>
					<CloseSolid tabindex="-1" class="cursor-pointer w-4 h-4 text-blue-500 hover:text-blue-700 focus:outline-none" on:click={() => newRequest.update(() => false)} />
				</Alert>
			</div>
		{/if}
	{/if}
	{#if newLowMoodData}
		{#if activeUrl == '/dashboard'}
			<div class="px-4 pt-4 bg-zinc-100">
				<Alert class="bg-red-200 flex justify-between items-center content-center text-red-900">
					<BellRingSolid tabindex="-1" class="text-red-700" />
					<div class="text-center">
						<span class="font-semibold">[{currStudentIDNotif}]</span>{notifText} click <button on:click={() => focusTable.update(() => true)} class="font-semibold hover:underline hover:text-blue-700">here</button> to view.
					</div>
					<CloseSolid tabindex="-1" class="cursor-pointer w-4 h-4 text-red-500 hover:text-red-700 focus:outline-none" on:click={() => (newLowMoodData = false)} />
				</Alert>
			</div>
		{:else}
			<div class="px-4 pt-4">
				<Alert class="bg-red-200 flex justify-between items-center content-center text-red-900">
					<BellRingSolid tabindex="-1" class="text-red-700" />
					<div class="text-center">
						To view the list of students experiencing low moods for atleast 4 consecutive
							days, please navigate to <a href="/dashboard" class="font-semibold hover:underline hover:text-blue-700">dashboard</a>.
					</div>
					<CloseSolid tabindex="-1" class="cursor-pointer w-4 h-4 text-red-500 hover:text-red-700 focus:outline-none" on:click={() => (newLowMoodData = false)} />
				</Alert>
			</div>
		{/if}
	{/if}
	<slot />
</main>
