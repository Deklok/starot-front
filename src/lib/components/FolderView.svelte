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
	import {
		DotsVerticalOutline,
		EditOutline,
		EditSolid,
		FolderArrowRightSolid,
		TrashBinSolid
	} from 'flowbite-svelte-icons';
	import TreeFolderView from './TreeFolderView.svelte';
	import ConfirmModal from './ConfirmModal.svelte';

	let { isLoggedIn } = page.data;

	let props = $props();

	let canEdit = $derived(props.canEdit || page.data.canEdit || false);
	let folderName = $derived(props.name || page.data.name);
	let folders = $derived(props.folders || page.data.folders || []);
	let images = $derived(props.images || page.data.images || []);
	let entries = $derived(props.entries || page.data.entries || []);
	let itemId = $derived(props.itemId || page.data.itemId | -1);

	let newFolderModal = $state(false);
	let newImageModal = $state(false);
	let tags = $state(page.data.tags);
	let modalTags = $state([]);
	let imgFile: File | null = $state(null);
	let imgUrl: string | null = $state(null);
	let editMode = $state(false);
	let isWorldRoot = $state(page.data.isWorldRoot || false);
	let showMoveModal = $state(false);
	let selectedFolder = $state<Folder | null>(null);
	let selectedItemId = $state(0);
	let folderStructure: Folder[] = $state([]);
	let showContextMenu = $state(false);
	let contextMenuX = $state(0);
	let contextMenuY = $state(0);
	let isFolderContext = $state(false);

	let editNameModal = $state(false);
	let currentName = $state('');

	let confirmDelete = $state(false);
	let finalConfirmDelete = $state(false);

	// Add this function to handle context menu
	function handleContextMenu(event: any, item: any, isFolder: boolean = false) {
		if (!canEdit) {
			return;
		}
		event.preventDefault();
		selectedItemId = item.id;
		currentName = item.name;
		contextMenuX = event.clientX;
		contextMenuY = event.clientY;
		isFolderContext = isFolder;
		showContextMenu = true;
	}

	// Add function to handle move modal
	async function openMoveModal() {
		isLoading.set(true);
		const worldUniqueName = page.params.world;
		folderStructure = [
			{
				id: 0,
				children: [],
				name: 'Raiz',
				uniqueName: '',
				parentId: 0
			}
		];
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
				if (itemId > 0) {
					redirectUrl = `${redirectUrl}?parentId=${itemId}`;
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

		const result = await fetch(form.action, {
			method: 'POST',
			body: formData
		});
		newImageModal = false;

		if (!result.ok) {
			notification.open('Ay, valio verga algo', true);
			return;
		}

		reloadPage();

		notification.open(`Imagen creada`, false);
	}

	async function handleFolderSubmit(event: SubmitEvent) {
		event.preventDefault();

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		const result = await fetch(form.action, {
			method: 'POST',
			body: formData
		});
		newFolderModal = false;

		if (!result.ok) {
			notification.open('Ay, valio verga algo', true);
			return;
		}

		notification.open(`Carpeta creado`, false);
		reloadPage();
	}

	async function updateTags() {
		isLoading.set(true);
		const formData = new FormData();
		formData.append(`tags`, JSON.stringify(tags));

		const result = await fetch('?/updateTags', {
			method: 'POST',
			body: formData
		});
		isLoading.set(false);
		editMode = false;

		if (!result.ok) {
			notification.open('Ay, valio verga algo', true);
			return;
		}

		notification.open('Tags actualizados yipiieeee');
	}

	async function handleNameEdit(event: SubmitEvent) {
		event.preventDefault();
		isLoading.set(true);
		const formData = new FormData();
		formData.append('name', currentName);
		formData.append('itemId', selectedItemId.toString());
		const result = await fetch('?/editName', {
			method: 'POST',
			body: formData
		});
		editNameModal = false;
		isLoading.set(false);

		if (!result.ok) {
			notification.open('Ay, valio verga algo', true);
			return;
		}
		
		notification.open('Nombre actualizado yipiieeee');
		reloadPage();
	}

	async function beginDeleteItem() {
		console.log('id to delete ', selectedItemId);

		isLoading.set(true);
		const formData = new FormData();
		formData.append('itemId', selectedItemId.toString());

		const worldUniqueName = page.params.world;
		const result = await fetch(`/${worldUniqueName}/folders`, {
			method: 'DELETE',
			body: formData
		});
		isLoading.set(false);
		
		if (!result.ok) {
			notification.open('Ay, valio verga algo', true);
			return;
		}

		notification.open('Coso eliminado yipiieee!');
		finalConfirmDelete = false;
		reloadPage();
	}
</script>

<div class="flex" data-sveltekit-preload-data="false">
	<div class="m-4 w-full bg-slate-700 p-4">
		<div class="text-4xl text-white">{folderName}</div>
		{#if editMode}
			<div class=" mb-6 justify-self-start">
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
					<Button onclick={updateTags} color="green">Dale candela</Button>
					<Button class="mx-2" onclick={() => (editMode = !editMode)} color="red">
						Me arrepenti we
					</Button>
				{:else}
					<Button onclick={() => (editMode = !editMode)} class="mx-2 mt-4" color="dark">
						<EditOutline class="mr-3"></EditOutline> Editar tags de carpeta
					</Button>
				{/if}
			{/if}
		</div>
		<div class="flex flex-wrap justify-around">
			{#each folders as folder}
				<Card
					href={folder.url}
					oncontextmenu={(e) => handleContextMenu(e, folder, true)}
					class="relative mx-1 my-6 w-full md:w-1/3 lg:w-1/4"
				>
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
						<div class="ml-4 flex-1 text-xl">
							{folder.name}
						</div>
					</div>
					{#if canEdit}
					<div class="absolute right-1 bottom-3 flex w-fit justify-end">
						<Button
							onclick={(e: any) => handleContextMenu(e, folder, true)}
							class="cursor-pointer p-1"
							color="dark"
						>
							<DotsVerticalOutline size="xl"></DotsVerticalOutline>
						</Button>
					</div>
					{/if}
				</Card>
			{/each}
		</div>
		<hr class="folder my-5" />
		<div class="flex flex-wrap justify-around">
			{#each entries as entry}
				<Card
					href={entry.url}
					img={entry.preview}
					class="relative
					m-3 flex w-[15rem] flex-col items-center
					justify-center"
					oncontextmenu={(e) => handleContextMenu(e, entry)}
				>
					<div class="mt-2 text-2xl w-fit">{entry.name}</div>
					{#if canEdit}
					<div class="absolute right-1 bottom-3 flex w-fit justify-end">
						<Button
							onclick={(e: any) => handleContextMenu(e, entry)}
							class="cursor-pointer p-2 hover:bg-slate-800"
						>
							<DotsVerticalOutline size="xl"></DotsVerticalOutline>
						</Button>
					</div>
					{/if}
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
					class="relative
					m-3 items-center"
					oncontextmenu={(e) => handleContextMenu(e, image)}
				>
					<div class="mt-2 text-2xl w-fit">{image.name}</div>
					{#if canEdit}
					<div class="absolute right-1 bottom-3 flex w-fit justify-end">
						<Button
							onclick={(e: any) => handleContextMenu(e, image)}
							class="cursor-pointer p-1"
							color="dark"
						>
							<DotsVerticalOutline size="xl"></DotsVerticalOutline>
						</Button>
					</div>
					{/if}
				</Card>
			{/each}
		</div>
		{#if folders.length === 0 && entries.length === 0 && images.length === 0}
			<div class="mt-4 text-center text-2xl text-white">No hay nada aqui</div>
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

<Modal classBody="flex justify-center" title="Editar nombre" bind:open={editNameModal} outsideclose>
	<form
		method="POST"
		action="?/editName"
		onsubmit={handleNameEdit}
		class="flex w-[90%] flex-col justify-center self-center"
	>
		<FloatingLabelInput
			class="mb-4 self-center"
			id="newFolderName"
			name="newFolderName"
			type="text"
			bind:value={currentName}
		>
			Nombre
		</FloatingLabelInput>
		<Button type="submit" class="my-5 w-[70%] self-center" color="green"
			>Editar nombre</Button
		>
	</form>
</Modal>

<!-- Add context menu -->
{#if showContextMenu}
	<div
		class="absolute z-50 rounded-lg border border-gray-700 bg-gray-800 shadow-lg"
		style="left: {contextMenuX}px; top: {contextMenuY}px"
	>
		<ul>
			{#if isFolderContext === false}
				<li class="hover:bg-slate-700">
					<Button class="flex text-white pl-2 w-full justify-start" 
					onclick={openMoveModal}>
						<FolderArrowRightSolid size="lg" class="m-4"></FolderArrowRightSolid>
						Mover a otra carpeta
					</Button>
				</li>
			{/if}
			<li class="hover:bg-slate-700">
				<Button onclick={() => {
					editNameModal = true;
					showContextMenu = false;
				}}
				class="flex text-white pl-2 w-full justify-start">
					<EditSolid size="lg" class="m-4"></EditSolid>
					Cambiar nombre
				</Button>
			</li>
			<li class="hover:bg-red-700">
				<Button onclick={() => {
					confirmDelete = true;
					showContextMenu = false;
				}}
				class="flex text-white pl-2 w-full justify-start">
					<TrashBinSolid size="lg" class="m-4"></TrashBinSolid>
					Eliminar
				</Button>
			</li>
		</ul>
	</div>
{/if}

<!-- Click outside to close context menu -->
{#if showContextMenu}
	<div class="fixed inset-0 z-40" onclick={() => (showContextMenu = false)}></div>
{/if}

<Modal title="Mover a otra carpeta" bind:open={showMoveModal} outsideclose>
	<div class="p-4">
		<TreeFolderView folders={folderStructure} bind:selectedFolder></TreeFolderView>

		<div class="mt-4 flex justify-end space-x-2">
			<Button color="red" onclick={() => (showMoveModal = false)}>Cancelar</Button>
			<Button color="green" onclick={moveItem} disabled={!selectedFolder}>Mover</Button>
		</div>
	</div>
</Modal>

{#if isLoggedIn && canEdit}
	<FloatingActionButton onSelect={handleOptionSelect} />
{/if}

<ConfirmModal 
    title="Tas apunto de borrar el articulo" 
    bind:open={confirmDelete} 
    autoclose
    onConfirm={() => {
		finalConfirmDelete = true;
		confirmDelete = false;
	}}
>
    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        Tas seguro de que quieres borrar este articulo? <b>TODO</b> lo guardado en la wiki se va a eliminar
    </p>
</ConfirmModal>

<ConfirmModal
    title="TAS SEGURISIMO BOLUDO?"
    customClass="max-h-[90vh]"
    bind:open={finalConfirmDelete}
    autoclose
    confirmText="Que si la ptm, denle fuego"
    onConfirm={() => beginDeleteItem()}
>
    <p class="text-4xl leading-relaxed text-gray-500 dark:text-gray-400">
        ESTAS TOTALMENTE SEGURX DE QUE NO ES UN MELTDOWN Y ESTAS EN TODAS TUS FUCKING CAPACIDADES
        MENTALES DE TOMAR ESTA DECISION??????????
    </p>
</ConfirmModal>


<style>
	hr.folder {
		border: hidden;
	}
</style>
