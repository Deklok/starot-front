<script lang="ts">
	import { page } from '$app/stores';
	import { Card } from 'flowbite-svelte';
	import CustomSideBar from '$lib/components/CustomSideBar.svelte';

	const dataLoaded = $page.data as FolderData;
	const folders = dataLoaded.folders;
    const images = dataLoaded.images;
    const characters = dataLoaded.characters;
	$: slug = $page.params.slug;
</script>

<div class="flex">
	<div class="hidden md:flex md:w-1/5">
		<CustomSideBar />
	</div>
	<div class="w-full md:w-4/5 m-4 p-4 bg-slate-700">
		<h1 class="text-white flex-grow">This is the gay page of {slug}</h1>
		<div class="flex flex-wrap justify-around">
			{#each folders as folder}
				<Card href={folder.url} class="my-6 mx-1 w-full md:w-1/3 lg:w-1/4">
					<div class="flex">
						<div class="flex-shrink">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="size-6"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
								/>
							</svg>
						</div>
						<div class="flex-1 ml-4">
							{folder.name}
						</div>
					</div>
				</Card>
			{/each}
		</div>
		<hr class="my-5">
        <div class="flex flex-wrap justify-around">
            {#each characters as character}
                <Card href={character.url} img={character.preview} class="
					flex flex-col items-center justify-center m-3
					w-[15rem]
				">
					<div class="mt-2 text-2xl">{character.name}</div>
				</Card>
            {/each}
        </div>
		<hr class="my-5">
        <div class="flex flex-wrap justify-around">
            {#each images as image}
                <Card href={image.url} img={image.preview} horizontal class="
					items-center m-3
				">
					<div class="mt-2 text-2xl">{image.name}</div>
				</Card>
            {/each}
        </div>
	</div>
</div>