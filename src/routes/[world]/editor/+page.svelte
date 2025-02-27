<script lang="ts">
	import { page } from "$app/state";
	import EntryEditor from "$lib/components/EntryEditor.svelte";
	import EntryView from "$lib/components/EntryView.svelte";
	import FolderView from "$lib/components/FolderView.svelte";
	import ImageView from "$lib/components/ImageView.svelte";

    const loadedData: any = page.data;
</script>

<div>
    <EntryEditor {...loadedData}></EntryEditor>
</div>