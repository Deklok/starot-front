<script lang="ts">
	import { page } from "$app/state";
	import EntryEditor from "$lib/components/EntryEditor.svelte";

    const loadedData: any = page.data;
</script>

<div>
    <EntryEditor {...loadedData}></EntryEditor>
</div>