<script lang="ts">
	import { page } from '$app/state';
	import { capitalizeFirstLetter } from '$lib/utils/stringFormat';
	import { A, Badge, Button, Card, Carousel, Modal, Table, TableBody, TableBodyCell, TableBodyRow, Thumbnails } from 'flowbite-svelte';
	import { EditOutline } from 'flowbite-svelte-icons';
	import MarkDown from './MarkDown.svelte';

    let { name, tags, images, sections, profileSections, entryImage, canEdit } = $props();
    
    const parsedImages = images.map((image: any) => ({
        alt: image.name,
        src: image.imageUrl,
        title: image.name
    }));
    const profileImage = entryImage;
    
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

    // Function to detect if a string likely contains markdown
    function isMarkdown(text: string): boolean {
        if (!text || typeof text !== 'string') return false;
        
        // Check for common markdown patterns
        const markdownPatterns = [
            /[*_]{1,2}[^*_]+[*_]{1,2}/, // Bold or italic
            /^#+\s/, // Headers
            /\[.+?\]\(.+?\)/, // Links
            /^-\s/, // List items
            /^>\s/, // Blockquotes
            /`[^`]+`/, // Inline code
            /```[\s\S]*?```/, // Code blocks
            /!\[.+?\]\(.+?\)/, // Images
            /\|[\s\S]+\|/, // Tables
            /^---$/ // Horizontal rule
        ];
        
        return markdownPatterns.some(pattern => pattern.test(text));
    }

    const itemRoute = page.url.href.split('/');
    const editLink = `/${itemRoute[3]}/editor/${itemRoute[4]}`;
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
        <div class="prose lg:prose-xl text-white container">
            <h1 class="text-4xl font-bold mb-4">{name}
                {#if canEdit}
                    <Button class="mx-2" href={editLink} color="dark">
                        <EditOutline></EditOutline>
                    </Button>
                {/if}
            </h1>
            {#each tags as tag}
                <Badge class="mx-2 mt-6 mb-6" href={tag.url} large color="dark" border>
                    {capitalizeFirstLetter(tag.name)} 
                </Badge>
            {/each}
            <Card img={profileImage} 
            class="flex md:float-right m-0 md:m-6 max-w-max md:max-w-[500px]">
                <Table striped={true}>
					<TableBody tableBodyClass="divide-y">
						{#each profileSections as row, i}
							<TableBodyRow>
								<TableBodyCell class="font-bold">
									{row.label}
								</TableBodyCell>
								<TableBodyCell class="font-normal">
									{#if isMarkdown(row.value)}
                                        <MarkDown content={row.value} />
                                    {:else}
                                        {row.value}
                                    {/if}
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
        {#if parsedImages.length > 0}
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
        {/if}
    </main>
</div>