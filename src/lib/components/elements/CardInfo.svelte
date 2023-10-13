<script>
	// @ts-nocheck
	import { Card, Label, Tooltip } from 'flowbite-svelte';
	import { ProfileCardOutline, FaceLaughOutline, BrainOutline } from 'flowbite-svelte-icons';

	export let title;
	export let data;
	export let purpose;

	let time = '', month = '', day = '', year = '';

	$: if(purpose === 'time'){
		let dateObj = new Date(data);

		let options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true };
		let monthOptions = { month: 'short' };

		time = dateObj.toLocaleTimeString('en-US', options);
		day = dateObj.getDate();
		month = dateObj.toLocaleDateString('en-US', monthOptions);
		year = dateObj.getFullYear();
	}
</script>

<Tooltip triggeredBy="#tooltip-recentStudent">Latest student who entered their mood data.</Tooltip>

{#if purpose === 'time'}
	<Card class='max-h-12 w-xs justify-center flex-row items-center space-x-2'>
		<p class="font-semibold text-red-700 text-sm">{month.toUpperCase()} {day}, {year}</p>
		<p class="text-slate-900 text-sm">{time.slice(0,-2)}<span class="font-semibold">{time.slice(-2)}</span></p>
	</Card>
{:else if purpose === 'mood'}
	<Card class='max-h-12 max-w-full justify-center flex-row items-center space-x-2'>
		<FaceLaughOutline tabindex="-1" class="text-slate-900" />
		<p class="text-slate-900 text-sm">
			{title} <span class="font-semibold">{data ?? 'N/A'}</span>
		</p>
	</Card>
{:else if purpose === 'reason'}
	<Card class='max-h-12 max-w-full justify-center flex-row items-center space-x-2'>
		<BrainOutline tabindex="-1" class="text-slate-900" />
		<p class="text-slate-900 text-sm">
			{title} <span class="font-semibold">{data ?? 'N/A'}</span>
		</p>
	</Card>
{:else}
	<Card id="tooltip-recentStudent" class='max-h-12 max-w-full justify-center flex-row items-center space-x-2'>
		<ProfileCardOutline tabindex="-1" class="text-slate-900" />
		<p class="text-slate-900 text-sm">
			{title} 
			<a class="font-semibold cursor-pointer" href="/students/student-chart?search={data}" rel="noopener noreferrer">
				{data ?? 'N/A'}
			</a>
		</p>
	</Card>
{/if}