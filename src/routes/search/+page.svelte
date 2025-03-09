<script lang="ts">
	import { page } from '$app/state';
	import FolderView from '$lib/components/FolderView.svelte';

	let itemsByWorld = $derived(page.data.itemsByWorld);
</script>

<div class="text-white text-2xl">
    Resultados de busqueda:
</div>
{#each itemsByWorld as world}
	<FolderView {...world}></FolderView>
{/each}
