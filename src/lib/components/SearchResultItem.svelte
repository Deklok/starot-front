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
	padding="xs"
	href={getUrl(item)}
	class="h-[13rem] w-[9rem]"
	imgClass="w-[9rem] h-[10rem]"
	img={item.preview || item.entryPreview || '/default.png'}
>
	<div class="w-full text-center text-lg text-white">
		{item.name}
	</div>
</Card>
