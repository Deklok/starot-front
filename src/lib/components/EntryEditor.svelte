<script lang="ts">
	import RichEditor from '$lib/components/RichEditor.svelte';
	import ImageFileDrop from '$lib/components/ImageFileDrop.svelte';
	import {
		Button,
		FloatingLabelInput,
		Modal
	} from 'flowbite-svelte';
	import { BarsOutline, CircleMinusSolid, CirclePlusSolid } from 'flowbite-svelte-icons';
	import DraggableGallery, {
		type DraggableGalleryItem
	} from '$lib/components/DraggableGallery.svelte';
	import TagEditor from './TagEditor.svelte';
	import { goto } from '$app/navigation';
	import { formatStringForURL } from '$lib/utils/formatUrl';
	import { isLoading } from '$lib/stores/loading';
	import { dndzone } from 'svelte-dnd-action';
	import { notification } from '$lib/stores/notification';
	import { page } from '$app/state';

	let { entryData = $bindable(), uniqueName } = $props<{
		entryData: EntryViewData;
		uniqueName: string | null;
	}>();

	let confirmDelete = $state(false);
	let confirmDeleteChar = $state(false);
	let finalConfirmDeleteChat = $state(false);

	let imgFile: File | null = $state(null);
	let imgUrl: string | null = $state(entryData.entryImage.length > 0 ? entryData.entryImage : null);

	let selectedToRemove = $state(0);

	let entryUniqueName = $state(uniqueName);
	let entryName = $state(entryData.name);
	let tags: CustomTag[] = $state(entryData.tags);

	let profileSections: SimpleItem[] = $state(entryData.profileSections);
	let parsedProfileSections = $state(
		profileSections.map((section, index) => ({
			id: index + 1,
			label: section.label,
			value: section.value
		}))
	);

	let sections: SimpleEntrySection[] = $state(entryData.sections);
	let parsedSections = $state(
		sections.map((section, index) => ({
			id: index + 1,
			title: section.title,
			content: section.content
		}))
	);

	let images: ImageResponseData[] = $state(entryData.images);
	let parsedImages: DraggableGalleryItem[] = $state(
		images.map((image, index) => ({
			id: index + 1,
			name: image.name,
			url: image.imageUrl
		}))
	);

	const addProfileSection = () => {
		parsedProfileSections.push({
			id: parsedProfileSections.length + 1,
			label: '',
			value: ''
		});
	};

	const removeProfileSection = (id: number) => {
		let toRemove = parsedProfileSections.findIndex((a: any) => a.id === id);
		if (toRemove !== -1) {
			parsedProfileSections.splice(toRemove, 1);
		}
		parsedProfileSections.forEach((item: any, index: number) => {
			item.id = index + 1;
		});
	}

	const addSection = () => {
		parsedSections.push({
			id: parsedSections.length + 1,
			title: 'Nueva seccion',
			content: ''
		});
	};
	

	const confirmRemove = (index: any) => {
		console.log('confirm to remove ', index);
		selectedToRemove = index;
		confirmDelete = true;
	};

	const removeSection = (id: number) => {
		let toRemove = parsedSections.findIndex((a: any) => a.id === id);
		if (toRemove !== -1) {
			parsedSections.splice(toRemove, 1);
		}
		parsedSections.forEach((item: any, index: number) => {
			item.id = index + 1;
		});
	}

	const openConfirmDelete = () => {
		confirmDeleteChar = false;
		finalConfirmDeleteChat = true;
	};

	async function saveChanges() {
		isLoading.set(true);
		const formData = new FormData();

		if (!imgFile && !imgUrl) {
			return;
		}

		formData.append(`name`, entryName);
		formData.append(`tags`, JSON.stringify(tags));
		if (imgFile) {
			formData.append(`image`, imgFile);
		} else {
			formData.append(`image`, imgUrl as string);
		}
		
		formData.append(`profile_sections`, JSON.stringify(parsedProfileSections));
		formData.append(`sections`, JSON.stringify(parsedSections));

		parsedImages.forEach((image, index) => {
			if (image.file) {
				formData.append(`entry_image_file_${index}`, image.file);
			} else {
				formData.append(`entry_image_url_${index}`, image.url);
			}
		});

		await fetch('?/newEntry', {
			method: 'POST',
			body: formData
		});

		isLoading.set(false);
		notification.open(`Cambios guardados yipiiieeee`);

		let worldUniqueName = page.params.world;
		let entryUniqueName = (page.params.entry)
			? page.params.entry
			: formatStringForURL(entryName);
		
			let parentQuery = page.url.searchParams.get('parentId');
		const parentId = (parentQuery) ? Number(parentQuery) : undefined;

		const finalUrl = (parentId)
		? `/${worldUniqueName}/${entryUniqueName}?parentId=${parentId}`
		: `/${worldUniqueName}/${entryUniqueName}`
		
		goto(finalUrl);
	}

	const beginDeleteCharacter = () => {
		finalConfirmDeleteChat = false;
	};

	function handleSortProfileSections(e: any) {
		parsedProfileSections = e.detail.items;
	}

	function handleSortSections(e: any) {
		parsedSections = e.detail.items;
	}
</script>

<div class="flex">
	<div class="m-4 flex w-full flex-col justify-center bg-slate-700 p-1 md:p-4">
		<div class="mb-8 flex w-full flex-wrap">
			<div class="w-full md:w-3/4">
				<div class="flex flex-wrap justify-center text-2xl text-white">
					<FloatingLabelInput
						class="w-full"
						classInput="text-4xl"
						classLabel="text-xl"
						bind:value={entryName}
						required
						id="character_name"
						name="floating_standard"
						type="text"
					>
						Titulo
					</FloatingLabelInput>
					<div class="my-4 flex w-full flex-col">
						<TagEditor bind:tags></TagEditor>
					</div>
				</div>
				<section
					use:dndzone={{ items: parsedProfileSections, type: 'attribute' }}
					onconsider={handleSortProfileSections}
					onfinalize={handleSortProfileSections}
				>
					{#each parsedProfileSections as row(row.id)}
						<div class="py-6 px-3 w-full rounded-2xl {row.id % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}">
							<div class="flex w-full justify-evenly">
								<BarsOutline size="lg" color="white" class="place-self-center mr-3"></BarsOutline>
								<div class="w-full mx-2">
									<FloatingLabelInput	bind:value={row.label} required></FloatingLabelInput>
									<textarea
										bind:value={row.value}
										rows="2"
										
										class="w-full mt-1 p-2 rounded-md bg-gray-900 text-white"
										required
									></textarea>
								</div>
								<Button
									pill
									outline
									color="red"
									onclick={() => removeProfileSection(row.id)}
									size="xs"
									class="!p2 w-fit h-fit place-self-center"
								>
									<CircleMinusSolid class="text-slate-50" />
								</Button>
							</div>
						</div>
					{/each}
				</section>
				<Button
					pill
					color="green"
					outline
					onclick={() => addProfileSection()}
					size="sm"
					class="!p2 mt-4 w-full"
				>
					<CirclePlusSolid class="size-6 text-slate-50" />
				</Button>
			</div>
			<div class="w-full px-6 md:w-1/4">
				<div class="my-6 text-center text-2xl text-white">Imagen de perfil</div>
				<ImageFileDrop bind:value={imgFile} bind:imgUrl />
				<div class="mt-6">
					<DraggableGallery bind:items={parsedImages} />
				</div>
			</div>
		</div>
		<section
			use:dndzone={{ items: parsedSections, type: 'section' }}
			onconsider={handleSortSections}
			onfinalize={handleSortSections}
		>
		{#each parsedSections as section(section.id)}
			<div class="flex">
				<BarsOutline size="xl" color="white" class="place-self-center mr-3"></BarsOutline>
				<div class="mb-8 w-[95%] flex-col">
					<div class="mb-4 text-2xl text-white">
						<FloatingLabelInput
							classInput="text-4xl"
							classLabel="text-xl"
							bind:value={section.title}
							required
							name="floating_standard"
							type="text"
						>
							Seccion
						</FloatingLabelInput>
					</div>
					<RichEditor bind:text={section.content} />
				</div>
				<div class="mx-4 flex object-center">
					<Button
						color="red"
						outline
						pill
						onclick={() => confirmRemove(section.id)}
						size="md"
						class="!p2 mt-8 w-fit self-center"
					>
						<CircleMinusSolid class="size-8 text-slate-50" />
					</Button>
				</div>
			</div>
		{/each}
		</section>
		<Button
			color="green"
			outline
			pill
			onclick={addSection}
			size="lg"
			class="!p2 mt-8 w-fit self-center"
		>
			Agregar seccion
			<CirclePlusSolid class="ml-3 size-8 text-slate-50" />
		</Button>
		<div class="flex justify-end">
			<Button
				color="green"
				outline
				pill
				onclick={saveChanges}
				size="lg"
				class="!p2 mx-4 mt-8 w-fit self-center"
			>
				Guardar cambios
			</Button>
			{#if entryUniqueName !== null}
				<Button
					color="red"
					outline
					pill
					onclick={() => (confirmDeleteChar = true)}
					size="lg"
					class="!p2 mx-4 mt-8 w-fit self-center"
				>
					Eliminar articulo
				</Button>
			{/if}
		</div>
	</div>
</div>
<Modal title="Tas seguro boludo?" bind:open={confirmDelete} autoclose>
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		Tas seguro de que quieres quitar la seccion {
			parsedSections.find((a: any) => a.id === selectedToRemove)?.title
		}
	</p>
	<svelte:fragment slot="footer">
		<Button onclick={() => removeSection(selectedToRemove)}>Si, de una</Button>
		<Button color="red">No, me mame</Button>
	</svelte:fragment>
</Modal>

<Modal title="Tas apunto de borrar el articulo" bind:open={confirmDeleteChar} autoclose>
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		Tas seguro de que quieres borrar este articulo? <b>TODO</b> lo guardado en la wiki se va a eliminar
	</p>
	<svelte:fragment slot="footer">
		<Button onclick={() => openConfirmDelete()}>Si, de una</Button>
		<Button color="red">No, me mame</Button>
	</svelte:fragment>
</Modal>

<Modal
	title="TAS SEGURISIMO BOLUDO?"
	class="max-h-[90vh]"
	bind:open={finalConfirmDeleteChat}
	autoclose
>
	<p class="text-4xl leading-relaxed text-gray-500 dark:text-gray-400">
		ESTAS TOTALMENTE SEGURX DE QUE NO ES UN MELTDOWN Y ESTAS EN TODAS TUS FUCKING CAPACIDADES
		MENTALES DE TOMAR ESTA DECISION??????????
	</p>
	<svelte:fragment slot="footer">
		<Button onclick={() => beginDeleteCharacter()}>Que si la ptm, denle fuego</Button>
		<Button color="red">No, me mame</Button>
	</svelte:fragment>
</Modal>
