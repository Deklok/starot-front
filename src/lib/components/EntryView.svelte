<script lang="ts">
	import { page } from '$app/state';
	import { capitalizeFirstLetter } from '$lib/utils/stringFormat';
	import { Badge, Button, Card, Carousel, Modal, Table, TableBody, TableBodyCell, TableBodyRow, Thumbnails } from 'flowbite-svelte';
	import { EditOutline } from 'flowbite-svelte-icons';
	import MarkDown from './MarkDown.svelte';

    let props = $props();
    
    let name = $derived(props.name || page.data.name);
    let tags = $derived(props.tags || page.data.tags || []);
    let images = $derived(props.images ||page.data.images || []);
    let sections = $derived(props.sections || page.data.sections || []);
    let profileSections = $derived(props.profileSections || page.data.profileSections || []);
    let entryImage = $derived(props.entryImage || page.data.entryImage);
    let canEdit = $derived(props.canEdit || page.data.canEdit || false);
    let updatedAt = $derived(props.updatedAt || page.data.updatedAt);
    
    const carouselImages = images.map((image: any) => ({
        alt: image.name,
        src: image.imageUrl,
        title: image.name
    }));
    
    let index = $state(0);
    let forward = $state(true);
    let showModal = $state(false);

    function openModal(event: any) {
        if (event.target.classList.contains('full-screen-viewable')) {
            showModal = true;
        }
    }

    function convertUtcToLocal(utcString: string): string {
        const utcDate = new Date(utcString);
        const options = { 
            day: "numeric", 
            month: "long", 
            year: "numeric"
        };
        // @ts-ignore
        return utcDate.toLocaleDateString("es", options);
    }

    const itemRoute = page.url.href.split('/');
    const editLink = `/${itemRoute[3]}/editor/${itemRoute[4]}`;
</script>

<Modal classDialog="justify-self-center"
classBody="w-full justify-self-center h-[95vh]" 
defaultClass="w-full" 
classHeader="hidden" size="xl"
title="Galeria" bind:open={showModal} autoclose outsideclose>  
    <Carousel
        class="h-[90vh]!"
        imgClass="w-full h-full object-contain"
        images={carouselImages}
        let:Indicators let:Controls 
        bind:index>
        <Controls />
        <Indicators />
    </Carousel>
</Modal>

<div class="flex w-full">
	<main class="w-full flex flex-wrap justify-center">
        <div class="prose lg:prose-xl text-white container">
            <h1 class="text-4xl font-bold mb-4">{name}
                {#if canEdit}
                    <Button class="mx-2" href={editLink} color="dark">
                        <EditOutline></EditOutline>
                    </Button>
                {/if}
            </h1>
            <div class="text-slate-400">
                Ultima actualización: {convertUtcToLocal(updatedAt)}
            </div>
            {#each tags as tag}
                <Badge class="mx-2 mt-6 mb-6" href={tag.url} large color="dark" border>
                    {capitalizeFirstLetter(tag.name)} 
                </Badge>
            {/each}
            <Card img={entryImage} 
            class="flex md:float-right m-0 md:m-6 max-w-max md:max-w-[500px]">
                <Table striped={true}>
					<TableBody tableBodyClass="divide-y">
						{#each profileSections as row, i}
							<TableBodyRow>
								<TableBodyCell class="font-bold">
									{row.label}
								</TableBodyCell>
								<TableBodyCell class="font-normal">
									<MarkDown content={row.value} />
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
            </Card>

            {#each sections as section}
                <h1 class="text-white text-4xl my-6"> {section.title} </h1>
                <div class="text-white text-lg my-6 section-html">{@html section.content}</div>
            {/each}
        </div>
        {#if carouselImages.length > 0}
        <div class="py-12">
            <div class="cursor-pointer" onclick={openModal}>
                <Carousel imgClass="full-screen-viewable" class="my-3" images={carouselImages} {forward} let:Indicators let:Controls bind:index>
                    <Controls/>
                    <Indicators/>
                </Carousel>
                <Thumbnails class="bg-transparent gap-3" let:Thumbnail let:image let:selected images={carouselImages} bind:index>
                    <Thumbnail {...image} {selected} 
                    class="max-h-64 rounded-md shadow-xl hover:outline hover:outline-primary-500" 
                    activeClass="outline outline-primary-400"
                    />
                </Thumbnails>
            </div>
        </div>
        {/if}
    </main>
</div>