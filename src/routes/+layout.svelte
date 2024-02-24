<script>
	// @ts-nocheck
	import '../app.postcss';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import _ from 'lodash';
	import dayjs from 'dayjs';
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
		DropdownItem,
		Indicator,
		Listgroup
	} from 'flowbite-svelte';
	import { ChevronDownOutline, BellRingSolid, CloseSolid, InboxSolid } from 'flowbite-svelte-icons';
	import { consistentLowMoods, focusTable, newRequest } from '$lib/stores/index.js';
	import { requestTypes, requestStatus } from '$lib/constants/index.js';
	import {
		//logoOg,
		moodTrailOG
	} from '$lib/img/index.js';

	export let data;

	const navDivClass = 'flex items-center justify-between container z-50 relative';
	const activeClass = 'text-blue-700 font-semibold';
	const chevronClass = 'w-3 h-3 ml-2 text-primary-800 dark:text-white inline focus:outline-0';
	const avatarClass = 'cursor-pointer fixed';

	let newLowMoodData = false;
	let currStudentIDNotif = '';
	let consistentStreaksInfo = new Map();
	const students = [];

	let notifText = '';

	let currentUser = {
		email: '',
		username: '',
		role: ''
	};

	$: ({ supabase, session } = data);
	$: activeUrl = $page.url.pathname;
	$: requestsData = data.requests;

	$: {
		if (session) {
			currentUser.email = session.user.email;
			currentUser.username = session.user.user_metadata.username;
			currentUser.role = session.user.user_metadata.role;
		}
	}

	onMount(async () => {
		const { data: { subscription } } = supabase.auth.onAuthStateChange((event, _session) => {
			console.log(event);
			if (_session?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		const reqChann = supabase.channel('reqChann')
			.on('postgres_changes', {
				event: '*',
					schema: 'public',
					table: 'Request'
				},(payload) => {
					if (payload.eventType === 'INSERT') {
						requestsData = _.cloneDeep([payload.new, ...requestsData]);
					} else if (payload.eventType === 'UPDATE') {
						const updatedIndex = requestsData.findIndex((req) => req.id === payload.old.id);

						if (updatedIndex !== -1) {
							requestsData.splice(updatedIndex, 1);
						}

						requestsData = _.cloneDeep(requestsData);
					}
				}
			).subscribe(); // (status) => console.log(activeUrl,status));

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
					notifText = ` has been added to the consistent low moods table, `;
					consistentStreaksInfo.set(studentId, { streaksLength }); // adds the streaksLength to the map
				}
			});
		});

		return () => {
			subscription.unsubscribe();
			reqChann.unsubscribe();
			unsubscribe();
		};
	});
</script>

<Navbar class="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700 divide-gray-100 dark:divide-gray-700 px-2 sm:px-4 drop-shadow-sm w-full relative z-20 print:hidden flex justify-center py-2.5" {navDivClass}>
	{#if session}
		<div class="flex flex-row space-x-3">
			<NavBrand tabindex="-1" href="/dashboard">
				<img src={moodTrailOG} alt="Placeholder Logo" class="w-32 h-fit" />
			</NavBrand>
	
			{#if activeUrl != '/requests'}
				<div>
					<label for="notification-menu">
						<Button class="relative focus:ring-2" size="sm" id="notification-menu">
							<InboxSolid class="outline-none text-white dark:text-white" />
							<span class="sr-only">Notifications</span>
							<Indicator color="blue" border size="xl" placement="top-right" class="text-xs font-bold">
								{#if requestsData}
									{requestsData.length}
								{:else}
									0
								{/if}
							</Indicator>
						</Button>
					</label>
					<Dropdown class="relative z-50 shadow-md rounded shadow-slate-300" placement="bottom" triggeredBy="#notification-menu">
						<div class="flex flex-col flex-wrap outline-red-500 max-w-fit rounded-lg space-y-2 p-3">
							<div class="flex justify-between items-center mb-4">
								<h5 class="text-base font-semibold leading-none text-gray-900">Pending Requests</h5>
								<a href="/requests"	class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">
									View all
								</a>
							</div>
							{#if requestsData}
								<Listgroup items={requestsData.slice(0, 4)} let:item class="border-0 dark:!bg-transparent">
									<div class="flex items-center space-x-4 rtl:space-x-reverse">
										<div class="flex-1 min-w-0">
											<p class="text-sm font-medium text-gray-900 truncate dark:text-white">
												{item.contact_num}
											</p>
											<p class="text-xs text-gray-500 truncate dark:text-gray-400">
												{requestTypes[item.request_type]}
											</p>
										</div>
										<div class="inline-flex items-center text-sm font-bold text-gray-900">
											{dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
										</div>
									</div>
								</Listgroup>
							{:else}
								<div class="flex items-center space-x-4 rtl:space-x-reverse">
									<p>No pending requests found.</p>
								</div>
							{/if}
						</div>
					</Dropdown>
				</div>
			{/if}
		</div>

		<div>
			<NavUl>
				<NavLi href="/dashboard" active={activeUrl === '/dashboard'} {activeClass}>Dashboard</NavLi>
				<NavLi href="/requests" active={activeUrl === '/requests'} {activeClass}>Requests</NavLi>
				<NavLi id="student-menu" class="cursor-pointer">
					Students<ChevronDownOutline class={chevronClass} />
				</NavLi>
				<Dropdown triggeredBy="#student-menu" dropdownClass="w-36 items-center relative z-20">
					<DropdownItem href="/students/student-list">Student List</DropdownItem>
					<DropdownItem href="/students/student-mood-information"
						>Student Mood Information</DropdownItem
					>
				</Dropdown>
			</NavUl>
		</div>

		<div class="flex space-x-3 items-center">
			<label for="avatar-menu">
				<Avatar class={avatarClass} id="avatar-menu" alt="User Profile Pic" border />
			</label>
			<Dropdown placement="left" triggeredBy="#avatar-menu" containerClass="mt-4">
				<DropdownHeader>
					<span class="block text-sm uppercase">{currentUser.username}</span>
					<span class="block truncate text-sm font-medium">{currentUser.email}</span>
				</DropdownHeader>
				<DropdownItem href="/settings/account">Account</DropdownItem>
				<!-- <DropdownItem href="/settings/itsupport">Ask IT Support</DropdownItem> -->
				{#if currentUser.role.toLowerCase() == 'admin'}
					<DropdownItem href="/settings/manage-users">Manage Users</DropdownItem>
				{/if}
				<DropdownDivider />
<!-- 				<DropdownItem class="italic font-light">moodtrail.supp@gmail.com</DropdownItem>
				<DropdownDivider /> -->
				<form method="POST" action="/logout">
					<DropdownItem type="submit">Log out</DropdownItem>
				</form>
			</Dropdown>
		</div>
	{:else}
		<NavBrand tabindex="-1" href="/">
			<img src={moodTrailOG} alt="Placeholder Logo" class="w-32 h-fit" />
		</NavBrand>

		{#if activeUrl != '/login/'}
			<Button href="/login" color="purple" class="mr-3 font-semibold tracking-wide">LOGIN</Button>
		{:else}
			<Button
				disabled
				color="purple"
				class="mr-3 font-semibold tracking-wide pointer-events-none">LOGIN</Button
			>
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
					<CloseSolid
						tabindex="-1"
						class="cursor-pointer w-4 h-4 text-blue-500 hover:text-blue-700 focus:outline-none"
						on:click={() => newRequest.update(() => false)}
					/>
				</Alert>
			</div>
		{:else}
			<div class="px-4 pt-4">
				<Alert class="bg-blue-100 text-blue-900 flex justify-between items-center content-center">
					<BellRingSolid tabindex="-1" class="text-blue-700" />
					<div>
						<span class="font-bold text-blue-700">(NEW)</span> Help request received!
					</div>
					<CloseSolid
						tabindex="-1"
						class="cursor-pointer w-4 h-4 text-blue-500 hover:text-blue-700 focus:outline-none"
						on:click={() => newRequest.update(() => false)}
					/>
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
						<span class="font-semibold">[{currStudentIDNotif}]</span>{notifText} click
						<button
							on:click={() => focusTable.update(() => true)}
							class="font-semibold hover:underline hover:text-blue-700">here</button
						> to view.
					</div>
					<CloseSolid
						tabindex="-1"
						class="cursor-pointer w-4 h-4 text-red-500 hover:text-red-700 focus:outline-none"
						on:click={() => (newLowMoodData = false)}
					/>
				</Alert>
			</div>
		{:else}
			<div class="px-4 pt-4">
				<Alert class="bg-red-200 flex justify-between items-center content-center text-red-900">
					<BellRingSolid tabindex="-1" class="text-red-700" />
					<div class="text-center">
						To view the list of students experiencing low moods for atleast 4 consecutive days,
						please navigate to <a
							href="/dashboard"
							class="font-semibold hover:underline hover:text-blue-700">dashboard</a
						>.
					</div>
					<CloseSolid
						tabindex="-1"
						class="cursor-pointer w-4 h-4 text-red-500 hover:text-red-700 focus:outline-none"
						on:click={() => (newLowMoodData = false)}
					/>
				</Alert>
			</div>
		{/if}
	{/if}
	<slot />
</main>
