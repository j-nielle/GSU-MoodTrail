<script>
	import { Alert, Card, Button, Input } from 'flowbite-svelte';
	import { enhance } from '$app/forms';
	export let data;
</script>

<svelte:head>
	<title>Ask IT Support</title>
</svelte:head>

<div class="p-8 ring-1 h-fit w-1/3 bg-white shadow-md drop-shadow-md rounded relative z-10">
	<div class="flex flex-col justify-between space-y-4 rounded">
		<div class="flex flex-row justify-between space-x-4 items-center">
			<div class="flex flex-col">
				<p class="text-xs uppercase font-bold text-black">display name</p>
			</div>
			<Button color="dark" class="text-white">Edit</Button>
		</div>
		<div class="flex flex-row justify-between space-x-4 items-center">
			<div class="flex flex-col">
				<p class="text-xs uppercase font-bold text-black">email address</p>
			</div>
			<Button color="dark" class="text-white">Edit</Button>
		</div>
		<div class="flex flex-row justify-between space-x-4 items-center">
			<div class="flex flex-col">
				<p class="text-xs uppercase font-bold text-black">password</p>
				<p class="text-xs uppercase text-black">*********</p>
			</div>
			<Button color="dark" class="text-white">Edit</Button>
		</div>
		<div class="flex flex-row justify-between space-x-4 items-center">
			<div class="flex flex-col">
				<p class="text-xs uppercase font-bold text-black">user role</p>
			</div>
		</div>
	</div>
</div>
