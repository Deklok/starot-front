<script lang="ts">
	import {
		AngleDownOutline,
		AngleRightOutline,
		FolderOutline,
		GlobeOutline
	} from 'flowbite-svelte-icons';
  import { SidebarDropdownWrapper, SidebarItem } from 'flowbite-svelte';
	import WorldTreeView from './WorldTreeView.svelte';

	let { folders, depth = 0, worldUniqueName } = $props<{
		folders: Folder[];
		depth?: number;
		worldUniqueName?: string
	}>();

	function getHref(folder: Folder) {
		if (depth === 0) {
			return `/${folder.uniqueName}`;
		}
		return `/${worldUniqueName}/${folder.uniqueName}?type=folder`;
	}

	let open = $state(false);

	function toggleOpen(event: Event) {
		// @ts-ignore
		if (
			event.target && 
			// @ts-ignore
			!event.target.nodeName.includes('SPAN')
		) { 
			event.preventDefault();	
			open = !open;
		}
	}
</script>

{#each folders as folder}
	{#if folder.children && folder.children.length > 0}
	<a href={getHref(folder)}>
        <SidebarDropdownWrapper	label={folder.name} onclick={toggleOpen} isOpen={open}>		
            <svelte:fragment slot="icon">
                {#if depth === 0}
                    <GlobeOutline
                        class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                    />
                {:else}
                    <FolderOutline
                        class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
                    />
                {/if}
            </svelte:fragment>

            <svelte:fragment slot="arrowup">
                <AngleDownOutline class="h-6 w-6" size=xl />
            </svelte:fragment>

            <svelte:fragment slot="arrowdown">
                <AngleRightOutline class="h-6 w-6" size=xl/>
            </svelte:fragment>

            <WorldTreeView 
                folders={folder.children} 
                depth={depth + 1}
                worldUniqueName={(depth === 0) ? folder.uniqueName : worldUniqueName}
            />
        </SidebarDropdownWrapper>
    </a>
	{:else}
		<SidebarItem label={folder.name} href={getHref(folder)}>
			<svelte:fragment slot="icon">
				{#if depth === 0}
					<GlobeOutline size=xl
						class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
					/>
				{:else}
					<FolderOutline size=xl
						class="h-6 w-6 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
					/>
				{/if}
			</svelte:fragment>
		</SidebarItem>
	{/if}
{/each}
