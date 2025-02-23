<script lang="ts">
    import { page } from '$app/stores';
    import CustomSideBar from '$lib/CustomSideBar.svelte';
	import { Badge } from 'flowbite-svelte';

    const dataLoaded = $page.data as ImageResponseData;
    const url = dataLoaded.imageUrl;
    const name = dataLoaded.name;
    const tags = dataLoaded.tags;
</script>

<div class="flex">
    <div class="hidden md:flex md:w-1/5">
		<CustomSideBar />
	</div>
	<div class="w-full md:w-4/5 m-4 p-4 bg-slate-700 flex justify-center">
        <figure class="text-center">
            <figcaption class="text-3xl text-white my-5">{name}</figcaption>
            <img src={url} alt={name} />
            {#each tags as tag}
                <Badge class="mx-2 mt-6" href={tag.url} large color="dark" border> {tag.name} </Badge>
            {/each}
        </figure>
    </div>
</div>