<script>
	import { Helper } from 'flowbite-svelte';

	export let color;
	export let msg;
</script>

<Helper {color} class="mb-2">
	{msg}
</Helper>
