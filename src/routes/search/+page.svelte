<script lang="ts">
	import { page } from '$app/state';
	import SearchResultItem from '$lib/components/SearchResultItem.svelte';
	let entries = $derived(page.data.items.entries);
	let folders = $derived(page.data.items.folders);
	let images = $derived(page.data.items.images);
</script>

<svelte:head>
  <title> Buscar </title>
</svelte:head>
<div class="text-white text-2xl mb-10">
    Resultados de busqueda:
</div>

<div class="text-white text-2xl my-3">
	Articulos
</div>
<div class="flex gap-6 flex-wrap">
	{#if entries.length == 0}
		<div class="text-white text-xl my-2 italic">
			Aqui no hay nah
		</div>
	{/if}
	{#each entries as item}
		<SearchResultItem {item}></SearchResultItem>
	{/each}
</div>

<div class="text-white text-2xl mt-6 my-3">
	Carpetas
</div>
<div class="flex gap-6 flex-wrap">
	{#if folders.length == 0}
		<div class="text-white text-xl my-2 italic">
			Aqui no hay nah
		</div>
	{/if}
	{#each folders as item}
		<SearchResultItem {item}></SearchResultItem>
	{/each}
</div>

<div class="text-white text-2xl my-3">
	Imagenes
</div>
<div class="flex gap-6 flex-wrap">
	{#if images.length == 0}
		<div class="text-white text-xl my-2 italic">
			Aqui no hay nah
		</div>
	{/if}
	{#each images as item}
		<SearchResultItem {item}></SearchResultItem>
	{/each}
</div>