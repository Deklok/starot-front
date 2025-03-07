<!-- FloatingActionButton.svelte -->
<script lang="ts">
	import { FileLinesSolid, FolderOpenSolid, ImageSolid } from 'flowbite-svelte-icons';
    import { fade, fly } from 'svelte/transition';
    
    let isOpen = false;
    
    // Options to display when FAB is clicked
    const options = [
      { id: 'folder', label: 'Carpeta' },
      { id: 'entry', label: 'Articulo' },
      { id: 'image', label: 'Imagen' }
    ];
    
    function toggleMenu() {
      isOpen = !isOpen;
    }
    
    export let onSelect = (optionId: string) => {};
    function selectOption(optionId: string) {
        onSelect(optionId);
        isOpen = false;
    }
  </script>
  
  <div class="fixed bottom-8 right-8 flex flex-col items-end z-50">
    {#if isOpen}
      <div class="p-4 rounded-2xl flex flex-col bg-slate-600" transition:fade={{ duration: 200 }}>
        {#each options as option, i}
          <button 
            class="bg-gray-800 text-white mb-3 py-3 px-4 rounded w-36 text-left shadow-md hover:bg-gray-700 transition-colors"
            on:click={() => selectOption(option.id)}
            transition:fly={{ y: 20, duration: 150, delay: i * 50 }}
          >
            <div class="flex">
                {option.label}
                {#if option.id === 'folder'}
                    <FolderOpenSolid class="mx-4" size="lg"></FolderOpenSolid>
                {/if}
                {#if option.id === 'image'}
                    <ImageSolid class="mx-4" size="lg"></ImageSolid>
                {/if}
                {#if option.id === 'entry'}
                    <FileLinesSolid class="mx-4" size="lg"></FileLinesSolid>
                {/if}
            </div>
          </button>
        {/each}
      </div>
    {/if}
    
    <button
      class="w-14 h-14 rounded-full bg-slate-800 text-white flex justify-center items-center shadow-lg 
      hover:bg-slate-600 transition-colors focus:outline-none"
      on:click={toggleMenu}
    >
      <span class="text-3xl font-bold mb-1">
        {#if isOpen}
          -
        {:else}
          +
        {/if}
      </span>
    </button>
  </div>