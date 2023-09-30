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
		DropdownHeader,
		DropdownItem
	} from 'flowbite-svelte';
	import { ChevronDownOutline, BellRingSolid, CloseSolid } from 'flowbite-svelte-icons';
	import { consistentLowMoods, focusTable, newRequest } from '$lib/stores/index.js';
	import placeholderLogo from '$lib/img/logo-no-background.svg';

	export let data;

	$: ({ supabase, session } = data);
	$: activeUrl = $page.url.pathname;

	const navDivClass = "mx-auto flex justify-between items-center w-full !z-50"
	const activeClass = "font-semibold text-blue-700"
	const chevronClass = "w-3 h-3 ml-2 text-primary-800 dark:text-white inline focus:outline-0"
	const avatarClass = "cursor-pointer fixed mr-3"
	const dropdownClass = "z-40 relative"
	const containerClass = "z-50 drop-shadow-lg w-fit mt-8"
	const dropdownItemClass = "py-2 text-sm font-medium cursor-pointer cupx-4 hover:bg-gray-100 dark:hover:bg-gray-600"

	let newLowMoodData = false;
	let consistentStreaksInfo = new Map();
	const students = [];

	onMount(() => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		const newRequestChannel = supabase.channel('newRequestChannel')
			.on('postgres_changes',{
					event: 'INSERT',
					schema: 'public',
					table: 'RequestEntries'
				},(payload) => {
					newRequest.update(() => true);
					setTimeout(() => {
						newRequest.update(() => false);
					}, 5000);
				}
			).subscribe((status) => console.log(activeUrl,status));

		const unsubscribe = consistentLowMoods.subscribe((updatedMoods) => {
			updatedMoods.forEach((moodEntry) => {
				const studentId = moodEntry.studentId;
				const streaksLength = moodEntry.streaks.length;

				if (!students.includes(studentId)) {
					students.push(studentId);
				}

				if (consistentStreaksInfo.has(studentId)) {
					if (streaksLength !== consistentStreaksInfo.get(studentId).streaksLength) {
						newLowMoodData = true;
					}
				} else {
					newLowMoodData = true;
				}

				consistentStreaksInfo.set(studentId, { streaksLength });
			});
		});

		return () => {
			subscription.unsubscribe();
			newRequestChannel.unsubscribe();
			unsubscribe();
		}
	});
</script>

<Navbar class="!p-4 drop-shadow-sm w-full mx-auto relative" {navDivClass}>
	{#if session}
		<NavBrand tabindex="-1" href="/dashboard" class="ml-3">
			<img src={placeholderLogo} alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
	{:else}
		<NavBrand tabindex="-1" href="/" class="ml-3">
			<img src={placeholderLogo} alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>
	{/if}

	{#if session}
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
			<Dropdown triggeredBy="#student-menu" class="w-36 items-center z-20">
				<DropdownItem href="/students/all-students">List of Students</DropdownItem>
				<DropdownItem href="/students/student-chart">Info and Charts</DropdownItem>
			</Dropdown>
		</NavUl>

		<label for="avatar-menu">
			<Avatar class={avatarClass} data-name={session?.user?.user_metadata?.name ?? 'User'}
				id="avatar-menu" alt="User Profile Pic" border>
				{session?.user?.user_metadata?.name ?? 'User'}
			</Avatar>
		</label>
		<Dropdown class={dropdownClass} placement="left" triggeredBy="#avatar-menu" {containerClass}>
			<DropdownHeader>
				<span class="block text-sm"> {session?.user?.user_metadata?.name ?? 'User'} </span>
				<span class="block text-sm font-medium truncate"> {session?.user?.email} </span>
			</DropdownHeader>
			<DropdownItem class="cursor-pointer" href="/settings/account">Settings</DropdownItem
			>
			<DropdownDivider />
			<form method="POST" action="/logout">
				<DropdownItem type="submit" class={dropdownItemClass}>Logout</DropdownItem>
			</form>
		</Dropdown>
	{:else}
		<div class="flex space-x-4">
			<Button href="/login" color="purple" class="mr-3">Login</Button>
		</div>
	{/if}
</Navbar>

<main>
	{#if $newRequest}
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
	{#if newLowMoodData}
		<div class="px-4 pt-4">
			<Alert class="bg-red-200 flex justify-between items-center content-center text-red-900">
				<BellRingSolid tabindex="-1" class="text-red-700" />
				<div class="text-center">
					{#if activeUrl != '/dashboard'}
						To view the list of students experiencing consistent low moods for atleast 4 consecutive
						days, please navigate to <span class="font-semibold">dashboard</span>.
					{:else}
						Click 
						<span role="button" tabindex="0" class="font-bold hover:underline" on:click={() => focusTable.update(() => true)} on:keypress={() => focusTable.update(() => true)}>
							here
						</span> to view the list of students experiencing consistent low moods for atleast 4 consecutive
						days.
					{/if}
				</div>
				<CloseSolid tabindex="-1" class="cursor-pointer w-4 h-4 text-red-500 hover:text-red-700 focus:outline-none" on:click={() => (newLowMoodData = false)} />
			</Alert>
		</div>
	{/if}
	<slot />
</main>
