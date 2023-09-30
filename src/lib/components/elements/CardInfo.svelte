<script>
	import { Card, Label } from 'flowbite-svelte';
	import { ProfileCardOutline, FaceLaughOutline, BrainOutline } from 'flowbite-svelte-icons';

	export let title;
	export let data;
	export let purpose;
</script>

{#if purpose === 'time'}
	<Card class='max-h-12 max-w-xs justify-center flex-row items-center space-x-2'>
		<Label class="text-slate-900 text-sm">{data ?? 'N/A'}</Label>
	</Card>
{:else if purpose === 'mood'}
	<Card class='max-h-12 max-w-full justify-center flex-row items-center space-x-2'>
		<FaceLaughOutline tabindex="-1" class="text-slate-900" />
		<Label class="text-slate-900 text-sm">
			{title} <span class="font-bold cursor-pointer">{data ?? 'N/A'}</span>
		</Label>
	</Card>
{:else if purpose === 'reason'}
	<Card class='max-h-12 max-w-full justify-center flex-row items-center space-x-2'>
		<BrainOutline tabindex="-1" class="text-slate-900" />
		<Label class="text-slate-900 text-sm">
			{title} <span class="font-bold cursor-pointer">{data ?? 'N/A'}</span>
		</Label>
	</Card>
{:else}
	<Card class='max-h-12 max-w-full justify-center flex-row items-center space-x-2'>
		<ProfileCardOutline tabindex="-1" class="text-slate-900" />
		<Label class="text-slate-900 text-sm">
			{title} <span class="font-bold cursor-pointer">{data ?? 'N/A'}</span>
		</Label>
	</Card>
{/if}