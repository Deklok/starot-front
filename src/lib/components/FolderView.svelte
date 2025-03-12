<script lang="ts">
	import { Badge, Button, Card, FloatingLabelInput, Modal } from 'flowbite-svelte';
	import FloatingActionButton from './FloatingActionButton.svelte';
	import { page } from '$app/state';
	import { isLoading } from '$lib/stores/loading';
	import TagEditor from './TagEditor.svelte';
	import ImageFileDrop from './ImageFileDrop.svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import { notification } from '$lib/stores/notification';
	import { capitalizeFirstLetter } from '$lib/utils/stringFormat';
	import { EditOutline, FolderArrowRightSolid } from 'flowbite-svelte-icons';
	import { currentItem } from '$lib/stores/item';
	import { get } from 'svelte/store';
	import TreeFolderView from './TreeFolderView.svelte';

	let { isLoggedIn } = page.data;

	let props = $props();
	
	let canEdit = $derived(props.canEdit || page.data.canEdit || false);
	let folderName = $derived(props.name || page.data.name);
	let folders = $derived(props.folders || page.data.folders || []);
	let images = $derived(props.images ||page.data.images || []);
	let entries = $derived(props.entries ||page.data.entries || []);

	let newFolderModal = $state(false);
	let newImageModal = $state(false);
	let tags = $state(page.data.tags);
	let modalTags = $state([]);
	let imgFile: File | null = $state(null);
	let imgUrl: string | null = $state(null);
	let editMode = $state(false);
	let isWorldRoot = $state(page.data.isWorldRoot || false);

	// Update these state variables
	let showMoveModal = $state(false);
	let selectedFolder = $state<Folder | null>(null);
	let selectedItemId = $state(0);
	let folderStructure: Folder[] = $state([]);
	let showContextMenu = $state(false);
	let contextMenuX = $state(0);
	let contextMenuY = $state(0);

	// Add this function to handle context menu
	function handleContextMenu(event: any, item: any) {
		if (!canEdit) {
			return;
		}
		event.preventDefault();
		selectedItemId = item.id;
		contextMenuX = event.clientX;
		contextMenuY = event.clientY;
		showContextMenu = true;
	}
	
	// Add function to handle move modal
	async function openMoveModal() {
		isLoading.set(true);
		const worldUniqueName = page.params.world;
		folderStructure = [{
			id: 0,
			children: [],
			type: 'folder',
			name: "Raiz",
			parentId: null,
			worldId: 0,
			uniqueName: '',
			createdAt: ''
		}];
		const result = await fetch(`/${worldUniqueName}/folders`);
		const data = await result.json();
		folderStructure.push(...data);
		isLoading.set(false);
		showMoveModal = true;
		showContextMenu = false;
	}

	async function moveItem() {
		isLoading.set(true);
		const formData = new FormData();
		formData.append('itemId', selectedItemId.toString());
		formData.append('folderId', selectedFolder!.id.toString());

		const worldUniqueName = page.params.world;
		const result = await fetch(`/${worldUniqueName}/folders`, {
			method: 'POST',
			body: formData
		});

		if (!result.ok) {
			notification.open('Ay, valio verga algo', true);
			return;
		}

		notification.open('Se movio coso yipiieee', false);
		invalidateAll();

		isLoading.set(false);
		showMoveModal = false;
	}

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
				const currentFolder = get(currentItem);
				if (currentFolder) {
					redirectUrl = `${redirectUrl}?parentId=${currentFolder.id}`;
				}
				goto(redirectUrl);
				break;

			case 'image':
				// Handle image upload
				newImageModal = true;
				break;
		}
	}

	function reloadPage() {
		invalidateAll();
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
			body: formData
		});

		notification.open(`Imagen creada`, false);
		newImageModal = false;
		reloadPage();
	}

	async function handleFolderSubmit(event: SubmitEvent) {
		event.preventDefault();

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		await fetch(form.action, {
			method: 'POST',
			body: formData
		});

		notification.open(`Carpeta creado`, false);
		newFolderModal = false;
		reloadPage();
	}

	async function updateTags() {
        isLoading.set(true);
        const formData = new FormData();
        formData.append(`tags`, JSON.stringify(tags));

        await fetch('?/updateTags', {
			method: 'POST',
			body: formData
		});

        isLoading.set(false);
        notification.open('Tags actualizados yipiieeee');
        editMode = false;
    }
</script>

<div class="flex" data-sveltekit-preload-data="false">
	<div class="m-4 w-full bg-slate-700 p-4">
		<div class="text-4xl text-white">{folderName}</div>
		{#if editMode}
			<div class=" justify-self-start mb-6">
				<TagEditor bind:tags></TagEditor>
			</div>
		{:else}
			{#each tags as tag}
				<Badge class="mx-2 mt-6" href={tag.url} large color="dark" border>
					{capitalizeFirstLetter(tag.name)}
				</Badge>
			{/each}
		{/if}
		<div class="flex">
			{#if canEdit && isWorldRoot === false}
				{#if editMode}
					<Button onclick={updateTags} color="green">
						Dale candela
					</Button>
					<Button class="mx-2" onclick={() => editMode = !editMode} color="red">
						Me arrepenti we
					</Button>
				{:else}
					<Button onclick={() => editMode = !editMode} 
					class="mx-2 mt-4" color="dark">
						<EditOutline class="mr-3"></EditOutline> Editar tags de carpeta
					</Button>
				{/if}
			{/if}
		</div>
		<div class="flex flex-wrap justify-around">
			{#each folders as folder}
				<Card href={folder.url} class="mx-1 my-6 w-full md:w-1/3 lg:w-1/4">
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
						<div class="ml-4 flex-1">
							{folder.name}
						</div>
					</div>
				</Card>
			{/each}
		</div>
		<hr class="folder my-5" />
		<div class="flex flex-wrap justify-around">
			{#each entries as entry}
				<Card
					href={entry.url}
					img={entry.preview}
					class="
					m-3 flex w-[15rem] flex-col items-center
					justify-center"
					oncontextmenu={(e) => handleContextMenu(e, entry)}
				>
					<div class="mt-2 text-2xl">{entry.name}</div>
				</Card>
			{/each}
		</div>
		<hr class="folder my-5" />
		<div class="flex flex-wrap justify-around">
			{#each images as image}
				<Card
					href={image.url}
					img={image.preview}
					horizontal
					class="
					m-3 items-center"
					oncontextmenu={(e) => handleContextMenu(e, image)}
				>
					<div class="mt-2 text-2xl">{image.name}</div>
				</Card>
			{/each}
		</div>
		{#if folders.length === 0 && entries.length === 0 && images.length === 0}
			<div class="text-white text-2xl mt-4 text-center">No hay nada aqui</div>
		{/if}
	</div>
</div>

<Modal
	classBody="flex justify-center"
	title="Nueva carpeta"
	bind:open={newFolderModal}
	outsideclose
>
	<form
		method="POST"
		action="?/newFolder"
		onsubmit={handleFolderSubmit}
		class="flex w-[90%] flex-col justify-center self-center"
	>
		<FloatingLabelInput
			class="mb-4 self-center"
			id="newFolderName"
			name="newFolderName"
			type="text"
		>
			Nombre
		</FloatingLabelInput>
		<div class="mt-6">
			<TagEditor bind:tags={modalTags}></TagEditor>
			<input type="hidden" name="tags" value={JSON.stringify(modalTags)} />
		</div>
		<Button disabled={$isLoading} type="submit" class="my-5 w-[70%] self-center" color="green"
			>Crear carpeta</Button
		>
	</form>
</Modal>

<Modal classBody="flex justify-center" title="Nueva imagen" bind:open={newImageModal} outsideclose>
	<form
		method="POST"
		action="?/newImage"
		onsubmit={handleImageSubmit}
		class="flex w-[90%] flex-col justify-center self-center"
	>
		<FloatingLabelInput class="mb-4 self-center" id="newImageName" name="newImageName" type="text">
			Nombre
		</FloatingLabelInput>
		<div class="my-4">
			<ImageFileDrop bind:value={imgFile} bind:imgUrl></ImageFileDrop>
		</div>
		<div class="mt-6">
			<TagEditor bind:tags={modalTags}></TagEditor>
			<input type="hidden" name="tags" value={JSON.stringify(modalTags)} />
		</div>
		<Button disabled={$isLoading} type="submit" class="my-5 w-[70%] self-center" color="green"
			>Crear imagen</Button
		>
	</form>
</Modal>

<!-- Add context menu -->
{#if showContextMenu}
  <div 
    class="absolute z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg"
    style="left: {contextMenuX}px; top: {contextMenuY}px"
  >
    <ul>
      <li class="hover:bg-slate-700">
		<div class="flex text-white">
			<FolderArrowRightSolid size="lg" class="m-4"
			></FolderArrowRightSolid>
			<button 
			class="w-full text-left px-4 py-2 text-xl"
			onclick={openMoveModal}
			>
			Mover a otra carpeta
			</button>
		</div>
      </li>
    </ul>
  </div>
{/if}

<!-- Click outside to close context menu -->
{#if showContextMenu}
  <div 
    class="fixed inset-0 z-40" 
    onclick={() => showContextMenu = false}
  ></div>
{/if}

<Modal
  title="Mover a otra carpeta"
  bind:open={showMoveModal}
  outsideclose
>
  <div class="p-4">
    <TreeFolderView
	folders={folderStructure}
	bind:selectedFolder={selectedFolder}
	></TreeFolderView>
    
    <div class="flex justify-end space-x-2 mt-4">
      <Button color="red" onclick={() => showMoveModal = false}>Cancelar</Button>
      <Button color="green" onclick={moveItem} disabled={!selectedFolder}>Mover</Button>
    </div>
  </div>
</Modal>

{#if isLoggedIn && canEdit}
	<FloatingActionButton onSelect={handleOptionSelect} />
{/if}

<style>
	hr.folder {
		border: hidden;
	}
</style>
