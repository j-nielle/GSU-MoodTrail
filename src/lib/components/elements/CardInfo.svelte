<script>
  import { Card, Label } from 'flowbite-svelte';
  import { ProfileCardOutline, FaceLaughOutline, BrainOutline } from 'flowbite-svelte-icons';

  export let title;
  export let icon;
  export let data;
  
  const infoCardClass = "max-h-10 justify-center flex-row items-center space-x-2"
</script>

<Card class={infoCardClass}>
  {#if icon==='ProfileCardOutline'}
	  <ProfileCardOutline tabindex="-1" class="text-slate-900" />
  {:else if icon==='FaceLaughOutline'}
    <FaceLaughOutline tabindex="-1" class="text-slate-900" />
  {:else if icon==='BrainOutline'}
    <BrainOutline tabindex="-1" class="text-slate-900" />
  {/if}
	{#if title === '' && icon === ''}
    <Label class="text-slate-900 text-sm">{data ?? 'N/A'}</Label>
  {:else}
    <Label class="text-slate-900 text-sm">{title} <span class="font-bold cursor-pointer">{data ?? 'N/A'}</span></Label>
  {/if}
</Card>