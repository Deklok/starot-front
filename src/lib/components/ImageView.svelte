<script lang="ts">
	import { capitalizeFirstLetter } from '$lib/utils/stringFormat';
	import { Badge } from 'flowbite-svelte';

    const { imageUrl, name, tags } = $props()
</script>

<div class="flex">
	<div class="w-full m-4 p-4 bg-slate-700 flex justify-center">
        <figure class="text-center">
            <figcaption class="text-3xl text-white my-5">{name}</figcaption>
            <img src={imageUrl} alt={name} />
            {#each tags as tag}
                <Badge class="mx-2 mt-6" href={tag.url} large color="dark" border> 
                    {capitalizeFirstLetter(tag.name)} 
                </Badge>
            {/each}
        </figure>
    </div>
</div>