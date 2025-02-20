<script lang="ts">
	import RichEditor from '$lib/RichEditor.svelte';
	import ImageFileDrop from '$lib/ImageFileDrop.svelte';
	import {
		Button,
		FloatingLabelInput,
		GradientButton,
		Label,
		Modal,
		Table,
		TableBody,
		TableBodyCell,
		TableBodyRow,
		TableHead,
		TableHeadCell
	} from 'flowbite-svelte';
	import { CircleMinusSolid, CirclePlusSolid } from 'flowbite-svelte-icons';

	let sections: CharacterSection[] = $state([]);
	let profileText = $state(`<br><br><br><br><br>`);
	let characterName = $state(``);
	let confirmDelete = $state(false);
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

	const addProfileSection = () => {
        profileSections.push({
            label: '',
            value: ''
        });
    }

    const removeProfileSection  = (index: number) => {
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
    
</script>

<div class="flex">
	<div class="m-4 flex w-full flex-col justify-center bg-slate-700 p-4">
		<div class="mb-8 flex">
			<div class="w-3/4">
				<div class="mb-4 text-2xl text-white">
					<FloatingLabelInput
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
				</div>
				<Table striped={true}>
					<TableBody tableBodyClass="divide-y">
						{#each profileSections as row, i}
							<TableBodyRow>
								<TableBodyCell>
									<FloatingLabelInput
                                    bind:value={row.label}
							        required
                                    ></FloatingLabelInput>
								</TableBodyCell>
								<TableBodyCell>
									<FloatingLabelInput
                                    bind:value={row.value}
							        required
                                    ></FloatingLabelInput>
								</TableBodyCell>
								<TableBodyCell class="flex justify-center">
									<Button
										pill
                                        outline
                                        color="red"
										on:click={() => removeProfileSection(i)}
										size="sm"
										class="!p2 w-fit"
									>
										<CircleMinusSolid class="text-slate-50 size-6" />
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
                    on:click={() => addProfileSection()}
                    size="sm"
                    class="!p2 w-full mt-4"
                >
                    <CirclePlusSolid class="text-slate-50 size-6" />
                </Button>
			</div>
			<div class="mx-6 w-1/4">
				<ImageFileDrop />
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
						on:click={() => confirmRemove(index)}
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
			on:click={addSection}
			size="lg"
			class="!p2 mt-8 w-fit self-center"
		> Agregar seccion
			<CirclePlusSolid class="size-8 text-slate-50 ml-3" />
		</Button>
	</div>
</div>
<Modal title="Tas seguro boludo?" bind:open={confirmDelete} autoclose>
	<p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
		Tas seguro de que quieres quitar la seccion {sections[selectedToRemove].title}
	</p>
	<svelte:fragment slot="footer">
		<Button on:click={() => removeSection()}>Si, de una</Button>
		<Button color="red">No, me mame</Button>
	</svelte:fragment>
</Modal>
