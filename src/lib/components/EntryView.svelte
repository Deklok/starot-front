<script lang="ts">
    import CustomSideBar from '$lib/components/CustomSideBar.svelte';
	import { capitalizeFirstLetter } from '$lib/utils/stringFormat';
	import { Badge, Card, Carousel, Modal, Table, TableBody, TableBodyCell, TableBodyRow, Thumbnails } from 'flowbite-svelte';

    let { name, tags, images, sections, profileSections, entryImage } = $props();
    
    const parsedImages = images.map((image: any) => ({
        alt: image.name,
        src: image.imageUrl,
        title: image.name
    }));
    const profileImage = entryImage;
    //const description = dataLoaded.description;
    
    let index = $state(0);
    let forward = $state(true);
    let showModal = $state(false);
    let selectedImage: any = $state(null);

    function openModal(event: any) {
        if (event.target.classList.contains('full-screen-viewable')) {
            selectedImage = parsedImages[index];
            showModal = true;
        }
    }
</script>

{#if selectedImage}
<Modal classDialog="justify-self-center"
bodyClass="object-scale-down" 
classBody="w-fit justify-self-center" 
defaultClass="w-fit" 
classHeader="hidden" size="xl"
title={selectedImage.title} bind:open={showModal} autoclose outsideclose>  
    <img class="max-h-[95vh] justify-self-center" src={selectedImage.src} alt={selectedImage.alt} />
</Modal>
{/if}

<div class="flex w-full">
	<main class="w-full flex flex-wrap justify-center">
        <div class="prose lg:prose-xl text-white">
            <h1 class="text-4xl font-bold mb-4">{name}</h1>
            {#each tags as tag}
                <Badge class="mx-2 mt-6" href={tag.url} large color="dark" border>
                    {capitalizeFirstLetter(tag.name)} 
                </Badge>
            {/each}
            <Card img={profileImage} class="float-right m-6">
                <Table striped={true}>
					<TableBody tableBodyClass="divide-y">
						{#each profileSections as row, i}
							<TableBodyRow>
								<TableBodyCell>
									{row.label}
								</TableBodyCell>
								<TableBodyCell>
									{row.value}
								</TableBodyCell>
							</TableBodyRow>
						{/each}
					</TableBody>
				</Table>
            </Card>

            {#each sections as section}
                <h1 class="text-white text-4xl my-6"> {section.title} </h1>
                <div class="text-white text-lg my-6">{@html section.content}</div>
            {/each}
        </div>
        <div class="py-12">
            <div class="cursor-pointer" onclick={openModal}>
                <Carousel imgClass="full-screen-viewable" class="my-3" images={parsedImages} {forward} let:Indicators let:Controls bind:index>
                    <Controls class="ignore-this" />
                    <Indicators class="ignore-this" />
                </Carousel>
                <Thumbnails class="bg-transparent gap-3" let:Thumbnail let:image let:selected images={parsedImages} bind:index>
                    <Thumbnail {...image} {selected} 
                    class="max-h-64 rounded-md shadow-xl hover:outline hover:outline-primary-500" 
                    activeClass="outline outline-primary-400"
                    />
                </Thumbnails>
            </div>
        </div>
    </main>
</div>