<script lang="ts">
	import { Alert } from 'flowbite-svelte';
	import { CheckOutline, CloseOutline } from 'flowbite-svelte-icons';
	import { fly } from 'svelte/transition';

	export let isError: boolean;
	export let message: string;
	export let isOpen: boolean;
	const color = isError ? 'red' : 'green';
</script>

<div hidden={!isOpen} class="fixed bottom-[1rem] left-[1rem] z-40">
	<Alert {color} transition={fly} class="flex border-t-4" dismissable={false}>
		{#if isError}
			<CloseOutline slot="icon" {color} size="xl" />
		{:else}
			<CheckOutline slot="icon" {color} size="xl" />
		{/if}
		<div class="text-xl text-white">{message}</div>
	</Alert>
</div>
