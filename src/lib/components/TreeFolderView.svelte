<script lang="ts">
  import { AngleDownOutline, AngleRightOutline, FolderOutline, GlobeOutline } from 'flowbite-svelte-icons';
  import TreeFolderView from './TreeFolderView.svelte';

  let { folders, selectedFolder = $bindable(), depth = 0 } = $props<{
    folders: Folder[];
    selectedFolder: Folder | null;
    depth?: number;
  }>();

  // Track expanded state of folders
  let expandedFolders: Set<number> = $state(new Set<number>());

  function toggleFolder(folderId: number) {
    let newExpandedFolders = new Set(expandedFolders);
    if (newExpandedFolders.has(folderId)) {
      newExpandedFolders.delete(folderId);
    } else {
      newExpandedFolders.add(folderId);
    }
    expandedFolders = newExpandedFolders;
  }

  function selectFolder(folder: Folder) {
    selectedFolder = folder;
  }

  let margin = depth * 16; // Adjust the multiplier (16) to control the margin increment
</script>

<div class="folder-tree text-white" style="margin-left: {margin}px;">
  {#each folders as folder}
    <div class="folder-item">
      <div
        class="folder-row flex cursor-pointer items-center rounded px-2 py-1 hover:bg-slate-600 {selectedFolder ===
        folder
          ? 'bg-slate-600'
          : ''}"
      >
        {#if folder.children && folder.children.length > 0}
          <button
            onclick={() => toggleFolder(folder.id)}
            class="mr-1 flex h-5 w-5 items-center justify-center text-slate-300"
          >
            {#if expandedFolders.has(folder.id)}
              <AngleDownOutline size="xl"></AngleDownOutline>
            {:else}
              <AngleRightOutline size="xl"></AngleRightOutline>
            {/if}
          </button>
        {:else}
          <div class="mr-1 h-5 w-5"></div>
        {/if}

        <div
          class="folder-name flex justify-items-center text-xl"
          onclick={() => selectFolder(folder)}
        >
          {#if folder.id == 0}
            <GlobeOutline class="mx-2" size="xl"></GlobeOutline>
          {:else}
            <FolderOutline class="mx-2" size="xl"></FolderOutline>
          {/if}
          {folder.name}
        </div>
      </div>

      {#if folder.children && folder.children.length > 0 && expandedFolders.has(folder.id)}
        <TreeFolderView
          folders={folder.children}
          bind:selectedFolder={selectedFolder}
          depth={depth + 1}>
        </TreeFolderView>
      {/if}
    </div>
  {/each}
</div>

<style>
  .folder-tree {
    max-height: 300px;
    overflow-y: auto;
  }

  .folder-row {
    transition: background-color 0.2s;
  }
</style>
