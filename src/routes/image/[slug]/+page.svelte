<script lang="ts">
    import { page } from '$app/stores';
    import CustomSideBar from '$lib/CustomSideBar.svelte';
	import { Badge } from 'flowbite-svelte';

    const dataLoaded = $page.data as ImageResponseData;
    const url = dataLoaded.imageUrl;
    const name = dataLoaded.name;
    const tags = dataLoaded.tags;
    $: slug = $page.params.slug;
</script>

<div class="flex">
    <div class="hidden md:flex md:w-1/5">
		<CustomSideBar />
	</div>
	<div class="w-full md:w-4/5 m-4 p-4 bg-slate-700 flex justify-center">
        <figure class="text-center">
            <figcaption class="text-3xl text-white my-5">{name}</figcaption>
            {#each tags as tag}
                <Badge class="mx-2 mb-6" href={tag.url} large color={tag.color}> {tag.name} </Badge>
            {/each}
            <img src={url} alt={name} />
        </figure>
    </div>
</div>