<script lang="ts">
	import { Button } from 'flowbite-svelte';
	import { CirclePlusSolid } from 'flowbite-svelte-icons';
	import { dndzone } from 'svelte-dnd-action';
	function handleSort(e: any) {
		items = e.detail.items;
	}

	export interface DraggableGalleryItem {
		id: number;
		url: string;
		name: string;
		file?: File;
	}

	let { items = $bindable() } = $props<{
		items: DraggableGalleryItem[]
	}>();
	let fileInput: HTMLElement;
	let diableButtons = $state(false);

	const removeImage = (id: number) => {
		diableButtons = true;
		let toRemove = items.findIndex((a: any) => a.id === id);
		if (toRemove !== -1) {
			items.splice(toRemove, 1);
		}
		items.forEach((item: any, index: number) => {
			item.id = index + 1;
		});
		diableButtons = false;
	}

	let fileRecievedHandler = (event: any) => {
		var selectedFile: File = event.target.files[0];
		if (selectedFile) {
			var reader = new FileReader();

			reader.onload = function(event: any) {
				let finalURl = event.target.result;
				items.push({
					id: items.length + 1,
					name: selectedFile.name,
					url: finalURl,
					file: selectedFile
				});
			}

			reader.readAsDataURL(selectedFile);
		}
	}
</script>

<section
	class="flex flex-col items-center overflow-y-scroll max-h-[35rem]"
	use:dndzone={{ items }}
	onconsider={handleSort}
	onfinalize={handleSort}
>
	{#each items as item (item.id)}
		<div class="flex items-center">
			<img class="max-h-[6rem] max-w-[6rem]" src={item.url} alt={item.name} />
			<Button pill outline color="red" disabled={diableButtons}
			onclick={() => removeImage(item.id)} size="xs" class="mx-4 w-fit">
				<div class="text-white text-xl">-</div>	
			</Button>
		</div>
	{/each}
</section>
<div class="place-self-center">
	<input bind:this={fileInput}
	type="file" id="imgupload" 
	onchange={fileRecievedHandler}
	style="display:none"/>	
	<Button
		color="green"
		outline
		pill
		onclick={() => {
			fileInput.click();
		}}
		disabled={diableButtons}
		size="lg"
		class="!p2 mt-8 w-fit self-center"
	>
		<CirclePlusSolid class="size-8 text-slate-50" />
	</Button>
</div>

<style>
</style>
