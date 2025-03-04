<script lang="ts">
	import { page } from "$app/state";
	import EntryView from "$lib/components/EntryView.svelte";
	import FolderView from "$lib/components/FolderView.svelte";
	import ImageView from "$lib/components/ImageView.svelte";

    let loadedData: any = $derived(page.data);
    let type = $derived(page.data.type);
</script>

<div>
    {#if type === 'folder'}
        <FolderView {...loadedData}></FolderView>
    {/if}

    {#if type === 'image'}
        <ImageView {...loadedData}></ImageView>
    {/if}

    {#if type === 'entry'}
        <EntryView {...loadedData}></EntryView>
    {/if}
</div>