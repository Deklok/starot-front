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
	import { CircleMinusSolid, CirclePlusSolid, MinusOutline } from 'flowbite-svelte-icons';
	import DraggableGallery from '$lib/components/DraggableGallery.svelte';
	import Notification from '$lib/components/Notification.svelte';

	let sections: SimpleEntrySection[] = $state([]);
	let characterName = $state(``);

	let confirmDelete = $state(false);
	let confirmDeleteChar = $state(false);
	let finalConfirmDeleteChat = $state(false);

	let isNotificationOpen = $state(false);
	let notificationMessage = $state(``);
	let isNotificationError = $state(false);

	let selectedToRemove = $state(0);
	let profileSections: SimpleItem[] = $state([
		{ label: 'Nombre', value: '' },
		{ label: 'Apodo', value: '' },
		{ label: 'Mundo', value: '' },
		{ label: 'Región', value: '' },
		{ label: 'Raza', value: '' },
		{ label: 'Altura', value: '' },
		{ label: 'Ocupaciones', value: '' },
		{ label: 'Familia', value: '' },
		{ label: 'Estado', value: '' },
		{ label: 'Pareja', value: '' },
		{ label: 'Estatus', value: '' }
	]);

	let images: ImageResponseData[] = $state([
		{ name: 'Pay pay', imageUrl: '/pay.png', tags: [] },
		{ name: 'Pay pay', imageUrl: '/maspay.png', tags: [] },
		{ name: 'Pay pay', imageUrl: '/pay.png', tags: [] },
		{ name: 'Pay pay', imageUrl: '/pay.png', tags: [] },
		{ name: 'Pay pay', imageUrl: '/pay.png', tags: [] }
	]);
	let parsedImages = $state(
		images.map((image, index) => ({
			id: index + 1,
			name: image.name,
			url: image.imageUrl
		}))
	);
	let tags: CustomTag[] = $state([
		{ name: 'Le entra a todo', url: '/' },
		{ name: 'Not a thought in her head', url: '/' },
		{ name: 'Con correa', url: '/' }
	]);

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

	let tagBind: string = $state('');
	const enterTag = (e: any) => {
		if (e.key === 'Enter') {
			tags.push({
				name: tagBind,
				url: ''
			});
			tagBind = ``;
		}
	};

	const closeBadge = (index: number) => {
		tags.splice(index, 1);
	};

	const openConfirmDelete = () => {
		confirmDeleteChar = false;
		finalConfirmDeleteChat = true;
	}

	const saveChanges = () => {
		isNotificationError = false;
		notificationMessage = `Personaje se ha salvao yipiieee!`;
		isNotificationOpen = true;
		setTimeout(() => {
			isNotificationOpen = false;
		}, 3000);
	}

	const beginDeleteCharacter = () => {
		finalConfirmDeleteChat = false;
	}
</script>

<div class="flex">
	<div class="m-4 flex w-full flex-col justify-center bg-slate-700 p-4">
		<Notification isOpen={isNotificationOpen} 
		isError={isNotificationError} message={notificationMessage} />
		<div class="w-full mb-8 flex flex-wrap">
			<div class="w-full md:w-3/4">
				<div class="mb-4 flex flex-wrap text-2xl text-white justify-center">
					<FloatingLabelInput
						class="w-full xs:w-1/2"
						classInput="text-4xl"
						classLabel="text-xl"
						bind:value={characterName}
						required
						id="character_name"
						name="floating_standard"
						type="text"
					>
						Personaje
					</FloatingLabelInput>
					<div class="flex w-fit flex-col xs:w-1/2">
						<div class="w-fit place-self-center">
							<FloatingLabelInput bind:value={tagBind} on:keypress={enterTag}>
								Tags
							</FloatingLabelInput>
						</div>
						<div class="mx-5 mt-3 flex flex-wrap">
							{#each tags as tag, i}
								<div class="flex h-fit">
									<Badge class="m-1" large color="dark" border>{tag.name}</Badge>
									<Button
										onclick={() => closeBadge(i)}
										pill
										outline
										color="dark"
										style="padding: 5px"
									>
										<MinusOutline class="" size="xl"></MinusOutline>
									</Button>
								</div>
							{/each}
						</div>
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
				<ImageFileDrop />
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
					<RichEditor text={section.content} />
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
			<Button
			color="red"
			outline
			pill
			onclick={() => confirmDeleteChar = true}
			size="lg"
			class="!p2 mt-8 w-fit self-center mx-4"
			>
				Eliminar personaje
			</Button>
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

<Modal title="Tas apunto de borrar el personaje" bind:open={confirmDeleteChar} autoclose>
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		Tas seguro de que quieres borrar este personaje? <b>TODO</b> lo guardado en la wiki se va a eliminar
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