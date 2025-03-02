<script lang="ts">
	import { page } from "$app/state";
	import FolderView from "$lib/components/FolderView.svelte";

    const loadedData: any = page.data;
	const isWorldRoot = true;
</script>

<FolderView {...loadedData, isWorldRoot}></FolderView>