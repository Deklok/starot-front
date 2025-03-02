<script lang="ts">
	import { notification } from '$lib/stores/notification';
	import { Alert } from 'flowbite-svelte';
	import { CheckOutline, CloseOutline } from 'flowbite-svelte-icons';
	import { onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';

	// Use a different approach to track the transition ending
	$: if ($notification.isClosing) {
		
		// When isClosing becomes true, set a safety timeout
		// This ensures we eventually clean up even if the transition event never fires
		const safetyTimeout = setTimeout(() => {
			notification.finishClose();
		}, 500);
		
		// Clean up the safety timeout if component is destroyed
		onDestroy(() => {
			clearTimeout(safetyTimeout);
		});
	}
</script>

{#if $notification.isOpen || $notification.isClosing}
	<div
		transition:fly={{ y: 300, duration: 300 }} 
		class="fixed bottom-[1rem] left-[1rem] z-40"
	>
		<Alert color={
			$notification.isError ? "red" : "green"
		} class="flex border-t-4" dismissable={false}>
			{#if $notification.isError}
				<CloseOutline slot="icon" color={
					$notification.isError ? "red" : "green"
				} size="xl" />
			{:else}
				<CheckOutline slot="icon" color={
					$notification.isError ? "red" : "green"
				} size="xl" />
			{/if}
			<div class="text-xl text-white">{$notification.message}</div>
		</Alert>
	</div>
{/if}