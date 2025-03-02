<script lang="ts">
	import { Button, Card, FloatingLabelInput, Modal } from 'flowbite-svelte';
	import FloatingActionButton from './FloatingActionButton.svelte';
	import { page } from '$app/state';
	import { isLoading } from '$lib/stores/loading';	
	import TagEditor from './TagEditor.svelte';
	import ImageFileDrop from './ImageFileDrop.svelte';
	import { goto } from '$app/navigation';

	const { 
		parentId, 
		isLoggedIn, 
		folders, 
		images, 
		entries 
	} = page.data;

	let newFolderModal = $state(false);
	let newImageModal = $state(false);
	let tags = $state([]);
	let imgFile: File | null = $state(null);
	let imgUrl: string | null = $state(null);
	
	function handleOptionSelect(optionId: string) {
		const selectedOption = optionId;
		
		switch (selectedOption) {
		case 'folder':
			// Handle folder creation
			newFolderModal = true;
			break;
		case 'entry':
			// Handle entry creation
			const worldUniqueName = page.params.world;
			let redirectUrl = `/${worldUniqueName}/editor`;
			if (parentId) {
				redirectUrl = `${redirectUrl}?parentId=${parentId}`
			}
			
			goto(redirectUrl);
			break;

		case 'image':
			// Handle image upload
			newImageModal = true;
			break;
		}
	}

	async function handleImageSubmit(event: SubmitEvent) {
        event.preventDefault();
		
		if (!imgFile) {
            return;
        }

        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);

        formData.append('image', imgFile); // Append the File object

        await fetch(form.action, {
            method: 'POST',
            body: formData,
        });
    }
</script>

<div class="flex" data-sveltekit-preload-data="false">
	<div class="w-full m-4 p-4 bg-slate-700">
		<div class="flex flex-wrap justify-around">
			{#if folders.length < 1}
				<div class="text-white"> Chale, no hay carpetas :c</div>
			{/if}
			{#each folders as folder}
				<Card href={folder.url} class="my-6 mx-1 w-full md:w-1/3 lg:w-1/4">
					<div class="flex">
						<div class="flex-shrink">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
								/>
							</svg>
						</div>
						<div class="flex-1 ml-4">
							{folder.name}
						</div>
					</div>
				</Card>
			{/each}
		</div>
		<hr class="my-5 folder">
        <div class="flex flex-wrap justify-around">
            {#if entries.length < 1}
				<div class="text-white"> Chale, no hay articulos :c</div>
			{/if}
			{#each entries as entry}
                <Card href={entry.url} img={entry.preview} class="
					flex flex-col items-center justify-center m-3
					w-[15rem]
				">
					<div class="mt-2 text-2xl">{entry.name}</div>
				</Card>
            {/each}
        </div>
		<hr class="my-5 folder">
        <div class="flex flex-wrap justify-around">
            {#if images.length < 1}
				<div class="text-white"> Chale, no hay imagenes :c</div>
			{/if}
			{#each images as image}
                <Card href={image.url} img={image.preview} horizontal class="
					items-center m-3
				">
					<div class="mt-2 text-2xl">{image.name}</div>
				</Card>
            {/each}
        </div>
	</div>
</div>

<Modal classBody="flex justify-center"
title="Nuevo folder" bind:open={newFolderModal} outsideclose>
	<form method="POST" action="?/newFolder"
	class="flex flex-col self-center justify-center w-[90%]">
		<FloatingLabelInput class="mb-4 self-center"
		id="newFolderName" name="newFolderName" type="text">
			Nombre
		</FloatingLabelInput>
		<div class="mt-6">
			<TagEditor bind:tags={tags}></TagEditor>
		</div>
		<Button disabled={$isLoading} type="submit"
		class="my-5 w-[70%] self-center" 
		color="green">Crear folder</Button>
	</form>
</Modal>

<Modal classBody="flex justify-center"
title="Nueva imagen" bind:open={newImageModal} outsideclose>
	<form method="POST" action="?/newImage" onsubmit={handleImageSubmit}
	class="flex flex-col self-center justify-center w-[90%]">
		<FloatingLabelInput class="mb-4 self-center"
		id="newImageName" name="newImageName" type="text">
			Nombre
		</FloatingLabelInput>
		<div class="my-4">
			<ImageFileDrop bind:value={imgFile} bind:imgUrl={imgUrl}
			></ImageFileDrop>
		</div>
		<div class="mt-6">
			<TagEditor bind:tags={tags}></TagEditor>
			<input type="hidden" name="tags" value={JSON.stringify(tags)}>
		</div>
		<Button disabled={$isLoading} type="submit"
		class="my-5 w-[70%] self-center" 
		color="green">Crear imagen</Button>
	</form>
</Modal>

{#if isLoggedIn}
	<FloatingActionButton onSelect={handleOptionSelect} />
{/if}

<style>
	hr.folder {
		border: hidden;
	}
</style>