<script lang="ts">
	import { Card } from 'flowbite-svelte';

	export let item: ItemSearchResult;

	function getUrl(item: ItemSearchResult) {
		const worldUniqueName = item.worldUniqueName;
		let parentId = item.parentId;

		let finalUrl = `/${worldUniqueName}/${item.uniqueName}`;
		if (item.type === 'folder' || item.type === 'image') {
			finalUrl = `${finalUrl}?type=${item.type}`;
			if (parentId) {
				finalUrl = `${finalUrl}&parentId=${parentId}`;
			}
		}

		return finalUrl;
	}
</script>

<Card
	href={getUrl(item)}
	class="relative m-3 w-[200px] h-[300px] rounded-2xl flex flex-col overflow-hidden"
>
	<div class="h-[200px] w-full overflow-hidden">
		<img
			src={item.preview || item.entryPreview || '/default.png'}
			alt={item.name}
			class="h-full w-full object-cover object-top rounded-xl"
		/>
	</div>
	<div class="flex-1 p-1 mt-3 text-center">
		<div class="text-2xl line-clamp-2 justify-self-center text-white">
			{item.name}
		</div>
	</div>
</Card>
