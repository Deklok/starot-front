<script lang="ts">
    import { page } from '$app/stores';
    import CustomSideBar from '$lib/CustomSideBar.svelte';
	import { Card, Carousel, Modal, Thumbnails } from 'flowbite-svelte';

    const dataLoaded = $page.data as CharacterProfileData;
    const sections = dataLoaded.sections;
    const name = dataLoaded.name;
    const tags = dataLoaded.tags;
    const rawImages = dataLoaded.images;
    const images = rawImages.map((image) => ({
        alt: image.name,
        src: image.imageUrl,
        title: image.name
    }));
    const profileImage = dataLoaded.profileImage;
    const description = dataLoaded.description;
    
    let index = 0;
    let forward = true;
    let showModal = false;
    let selectedImage: any = null;

    $: slug = $page.params.slug;

    function openModal(event: any) {
        if (event.target.classList.contains('full-screen-viewable')) {
            selectedImage = images[index];
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

<div class="flex">
    <aside class="hidden md:flex md:w-1/5">
		<CustomSideBar />
	</aside>
	<main class="w-full md:w-4/5 m-4 p-4 bg-slate-700 flex flex-wrap justify-center">
        <div class="prose lg:prose-xl text-white">
            <h1 class="text-4xl font-bold mb-4">{name}</h1>
            <Card img={profileImage} class="float-right m-6">
                <div>{description}</div>
            </Card>

            {#each sections as section}
                <h1 class="text-white text-4xl my-6"> {section.title} </h1>
                <div class="text-white text-lg my-6">{@html section.content}</div>
            {/each}
        </div>
        <div class="py-12">
            <div class="cursor-pointer" on:click={openModal}>
                <Carousel imgClass="full-screen-viewable" class="my-3" {images} {forward} let:Indicators let:Controls bind:index>
                    <Controls class="ignore-this" />
                    <Indicators class="ignore-this" />
                </Carousel>
                <Thumbnails class="bg-transparent gap-3" let:Thumbnail let:image let:selected {images} bind:index>
                    <Thumbnail {...image} {selected} 
                    class="max-h-64 rounded-md shadow-xl hover:outline hover:outline-primary-500" 
                    activeClass="outline outline-primary-400"
                    />
                </Thumbnails>
            </div>
        </div>
    </main>
</div>