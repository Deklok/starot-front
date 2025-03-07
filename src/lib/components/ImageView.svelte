<script lang="ts">
	import { page } from '$app/state';
	import { capitalizeFirstLetter } from '$lib/utils/stringFormat';
	import { Badge, Button } from 'flowbite-svelte';
	import { EditOutline } from 'flowbite-svelte-icons';
	import TagEditor from './TagEditor.svelte';
	import { isLoading } from '$lib/stores/loading';
	import { notification } from '$lib/stores/notification';

    const { imageUrl, name, canEdit } = $props();
    let tags = $state(page.data.tags);
    let editMode = $state(false);

    async function updateTags() {
        isLoading.set(true);
        const formData = new FormData();
        formData.append(`tags`, JSON.stringify(tags));

        await fetch('?/updateTags', {
			method: 'POST',
			body: formData
		});

        isLoading.set(false);
        notification.open('Tags actualizados yipiieeee');
        editMode = false;
    }
</script>

<div class="flex">
	<div class="w-full m-4 p-4 bg-slate-700 flex justify-center">
        <figure class="text-center">
            <figcaption class="text-3xl text-white my-5">{name}</figcaption>
            <img src={imageUrl} alt={name} />
            {#if editMode}
                <TagEditor bind:tags={tags}></TagEditor>
            {:else}
                {#each tags as tag}
                    <Badge class="mx-2 mt-6" href={tag.url} large color="dark" border> 
                        {capitalizeFirstLetter(tag.name)} 
                    </Badge>
                {/each}
            {/if}
        </figure>
    </div>
</div>
<div class="flex justify-center">
    {#if canEdit}
        {#if editMode}
            <Button onclick={updateTags} color="green">
                Dale pa lante
            </Button>
            <Button class="mx-2" onclick={() => editMode = !editMode} color="red">
                Me arrepenti we
            </Button>
        {:else}
            <Button onclick={() => editMode = !editMode} 
            class="mx-2" color="dark">
                <EditOutline class="mr-3"></EditOutline> Editar tags
            </Button>
        {/if}
    {/if}
</div>