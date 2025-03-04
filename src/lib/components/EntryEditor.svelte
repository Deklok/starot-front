<script lang="ts">
	import RichEditor from '$lib/components/RichEditor.svelte';
	import ImageFileDrop from '$lib/components/ImageFileDrop.svelte';
	import {
		Badge,
		Button,
		FloatingLabelInput,
		Modal,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow
	} from 'flowbite-svelte';
	import { CircleMinusSolid, CirclePlusSolid } from 'flowbite-svelte-icons';
	import DraggableGallery, { type DraggableGalleryItem } from '$lib/components/DraggableGallery.svelte';
	import TagEditor from './TagEditor.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { formatStringForURL } from '$lib/utils/formatUrl';
	import { isLoading } from '$lib/stores/loading';

	let  { entryData = $bindable(), uniqueName } = $props<{
		entryData: EntryViewData,
		uniqueName: string | null
	}>();
	
	let confirmDelete = $state(false);
	let confirmDeleteChar = $state(false);
	let finalConfirmDeleteChat = $state(false);

	let imgFile: File | null = $state(null);
	let imgUrl: string | null = $state(null);

	let selectedToRemove = $state(0);
	
    let entryUniqueName = uniqueName;
	let entryName = $state(entryData.name);
	let tags: CustomTag[] = $state(entryData.tags);
	let profileSections: SimpleItem[] = $state(entryData.profileSections);
	let images: ImageResponseData[] = $state(entryData.images);
    let sections: SimpleEntrySection[] = $state(entryData.sections);
	let parsedImages: DraggableGalleryItem[] = $state(
		images.map((image, index) => ({
			id: index + 1,
			name: image.name,
			url: image.imageUrl
		}))
	);

	const addProfileSection = () => {
		profileSections.push({
			label: '',
			value: ''
		});
	};

	const removeProfileSection = (index: number) => {
		selectedToRemove = index;
		profileSections.splice(selectedToRemove, 1);
	};

	const addSection = () => {
		sections.push({
			title: 'Nueva seccion',
			content: ``
		});
	};

	const confirmRemove = (index: number) => {
		selectedToRemove = index;
		confirmDelete = true;
	};

	const removeSection = () => {
		sections.splice(selectedToRemove, 1);
		selectedToRemove = 0;
		confirmDelete = false;
	};

	const openConfirmDelete = () => {
		confirmDeleteChar = false;
		finalConfirmDeleteChat = true;
	}

	async function saveChanges() {
		isLoading.set(true);
		console.log('entered save entry');
		const formData = new FormData();

		if (!imgFile) {
			return;
		}

		formData.append(`name`, entryName);
		formData.append(`tags`, JSON.stringify(tags));
		formData.append(`image`, imgFile);
		formData.append(`profile_sections`, JSON.stringify(profileSections));
		formData.append(`sections`, JSON.stringify(sections));

		parsedImages.forEach((image, index) => {
			if (image.file) {
				formData.append(`entry_image_file_${index}`, image.file);
			} else {
				formData.append(`entry_image_url_${index}`, image.url);
			}
		});

		const worldUniqueName = page.params.world;
		
		await fetch('?/newEntry', {
            method: 'POST',
            body: formData,
        });

		isLoading.set(false);
		console.log('ended thing');
		goto(`/${worldUniqueName}/${formatStringForURL(entryName)}`);
	}

	const beginDeleteCharacter = () => {
		finalConfirmDeleteChat = false;
	}
</script>

<div class="flex">
	<div class="m-4 flex w-full flex-col justify-center bg-slate-700 p-4">
		<div class="w-full mb-8 flex flex-wrap">
			<div class="w-full md:w-3/4">
				<div class="flex flex-wrap text-2xl text-white justify-center">
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
					<div class="flex w-full flex-col my-4">
						<TagEditor bind:tags={tags}></TagEditor>
					</div>
				</div>
				<Table striped={true}>
					<TableBody tableBodyClass="divide-y">
						{#each profileSections as row, i}
							<TableBodyRow>
								<TableBodyCell class="flex-wrap">
									<FloatingLabelInput bind:value={row.label} required></FloatingLabelInput>
								</TableBodyCell>
								<TableBodyCell>
									<FloatingLabelInput bind:value={row.value} required></FloatingLabelInput>
								</TableBodyCell>
								<TableBodyCell class="flex justify-center">
									<Button
										pill
										outline
										color="red"
										onclick={() => removeProfileSection(i)}
										size="sm"
										class="!p2 w-fit"
									>
										<CircleMinusSolid class="size-6 text-slate-50" />
									</Button>
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
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
			<div class="w-full md:w-1/4 px-6">
				<div class="text-white text-2xl text-center my-6">
					Imagen de perfil
				</div>
				<ImageFileDrop bind:value={imgFile} bind:imgUrl={imgUrl} />
				<div class="mt-6">
					<DraggableGallery bind:items={parsedImages} />
				</div>
			</div>
		</div>
		{#each sections as section, index}
			<div class="flex">
				<div class="mb-8 w-[95%] flex-col">
					<div class="mb-4 text-2xl text-white">
						<FloatingLabelInput
							classInput="text-4xl"
							classLabel="text-xl"
							bind:value={section.title}
							required
							id="title-{index}"
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
						onclick={() => confirmRemove(index)}
						size="md"
						class="!p2 mt-8 w-fit self-center"
					>
						<CircleMinusSolid class="size-8 text-slate-50" />
					</Button>
				</div>
			</div>
		{/each}
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
			class="!p2 mt-8 w-fit self-center mx-4"
			>
				Guardar cambios
			</Button>
			{#if entryUniqueName !== null}
				<Button
				color="red"
				outline
				pill
				onclick={() => confirmDeleteChar = true}
				size="lg"
				class="!p2 mt-8 w-fit self-center mx-4"
				>
					Eliminar articulo
				</Button>
			{/if}
		</div>
	</div>
</div>
<Modal title="Tas seguro boludo?" bind:open={confirmDelete} autoclose>
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		Tas seguro de que quieres quitar la seccion {sections[selectedToRemove].title}
	</p>
	<svelte:fragment slot="footer">
		<Button onclick={() => removeSection()}>Si, de una</Button>
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

<Modal title="TAS SEGURISIMO BOLUDO?" class="max-h-[90vh]"
bind:open={finalConfirmDeleteChat} autoclose>
	<p class="text-4xl leading-relaxed text-gray-500 dark:text-gray-400">
		ESTAS TOTALMENTE SEGURX DE QUE NO ES UN MELTDOWN Y ESTAS EN TODAS TUS FUCKING
		CAPACIDADES MENTALES DE TOMAR ESTA DECISION??????????
	</p>
	<svelte:fragment slot="footer">
		<Button onclick={() => beginDeleteCharacter()}>Que si la ptm, denle fuego</Button>
		<Button color="red">No, me mame</Button>
	</svelte:fragment>
</Modal>