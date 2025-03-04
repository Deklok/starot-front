<script lang="ts">
	import { applyAction, enhance } from "$app/forms";
	import { goto, invalidateAll } from "$app/navigation";
	import { page } from "$app/state";
	import { isLoading } from '$lib/stores/loading';
	import { Button, Card, FloatingLabelInput, Modal } from "flowbite-svelte";
	import { GlobeSolid, PlusOutline } from "flowbite-svelte-icons";

	const { worlds, isLoggedIn } = page.data;
	let newWorldModal = $state(false);
</script>

<div class="flex w-full flex-wrap items-center justify-center">
	{#each worlds as  world}
		<Card href={world.uniqueName}
		class="w-full md:w-1/2 lg:w-1/3 mx-2 my-2 text-white flex-wrap
		flex text-center items-center gap-2">
			<GlobeSolid></GlobeSolid>
			{world.name}
		</Card>
	{/each}
</div>

{#if isLoggedIn}
<div class="flex justify-center">
	<Button outline size="xl" color="green"
	onclick={() => newWorldModal = true}
	class="flex justify-items-center focus:ring-0 focus:outline-none mt-6 text-4xl">
		<GlobeSolid size="lg"></GlobeSolid>
		<PlusOutline class="mx-1" size="lg"></PlusOutline>
	</Button>
</div>
<Modal classBody="flex justify-center"
title="Nuevo mundo" bind:open={newWorldModal} outsideclose>
	<form method="POST" action="?/newWorld"
	use:enhance={() => {
		isLoading.set(true);
		return async({ result }) => {
			isLoading.set(false);
			if (result.type === 'redirect') {
				goto(result.location);
			} else {
				await applyAction(result);
			}
		}
	}}
	class="flex flex-col self-center justify-center w-[90%]">
		<FloatingLabelInput class="mb-4 self-center"
		id="newWorldName" name="newWorldName" type="text">
			Nombre
		</FloatingLabelInput>
		<Button disabled={$isLoading} type="submit"
		class="my-5 w-[70%] self-center" 
		color="green">Crear</Button>
	</form>
</Modal>
{/if}