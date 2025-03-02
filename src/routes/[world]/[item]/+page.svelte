<script lang="ts">
	import { page } from "$app/state";
	import EntryView from "$lib/components/EntryView.svelte";
	import FolderView from "$lib/components/FolderView.svelte";
	import ImageView from "$lib/components/ImageView.svelte";

    const loadedData: any = page.data;
    console.log('loadedData var on svelte page ', loadedData);
</script>

<div>
    {#if loadedData.type === 'folder'}
        <FolderView {...loadedData}></FolderView>
    {/if}

    {#if loadedData.type === 'image'}
        <ImageView {...loadedData}></ImageView>
    {/if}

    {#if loadedData.type === 'entry'}
        <EntryView {...loadedData}></EntryView>
    {/if}
</div>