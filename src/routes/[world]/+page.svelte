<script lang="ts">
	import { page } from "$app/state";
	import FloatingActionButton from "$lib/components/FloatingActionButton.svelte";
	import FolderView from "$lib/components/FolderView.svelte";

    const loadedData = page.data;
</script>

<FolderView dataLoaded={loadedData as FolderData}></FolderView>