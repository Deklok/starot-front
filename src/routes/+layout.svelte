<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { Button, Dropdown, DropdownItem, Navbar, NavBrand, Search } from 'flowbite-svelte';
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import UserSideBar from '$lib/components/UserSideBar.svelte';
	import { ArrowLeftOutline, BarsOutline, ChevronDownOutline, CloseOutline, PaperClipOutline, SearchOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/state';
	import Notification from '$lib/components/Notification.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import MobileDrawer from '$lib/components/MobileDrawer.svelte';
	import { goto } from '$app/navigation';

	const username = $derived(page.data.username);
	const isLoggedIn = $derived(page.data.isLoggedIn);
	const worlds = $derived(page.data.worlds);
	const folderWorldsStructure = $derived(page.data.folderWorldsStructure);

	let query: string = $state(``);
	
	// Toggle sidebar function
	function toggleSidebar() {
		$sidebarOpen = !$sidebarOpen;
	}
	
	// Handle window resize
	function handleResize() {
		$sidebarOpen = window.innerWidth >= 1300;
	}

	onMount(() => {
		// Add resize listener
		window.addEventListener('resize', handleResize);
		
		// Initialize sidebar state based on current window size
		handleResize();

		// Cleanup listener on component destroy
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

    let searchTerms: string[] = $state([]);
    let currentInput: string = $state('');

    // Modified search function to handle multiple terms
    function search() {
        if (searchTerms.length === 0) {
			goto(`/search?query=${currentInput}`);
		} else {
			const queryString = searchTerms.join(',');
			goto(`/search?tags=${queryString}`);
		}
    }

    // Add new term from input
    function addSearchTerm(event: KeyboardEvent) {
        if (event.key === 'Enter' && currentInput.trim()) {
            searchTerms = [...searchTerms, currentInput.trim()];
            currentInput = '';
        }
    }

    // Remove term
    function removeSearchTerm(index: number) {
        searchTerms = searchTerms.filter((_, i) => i !== index);
    }

	// Smart back button handler
	function handleBack() {
		history.back();
	}	
</script>

<div class="flex h-screen overflow-hidden" data-sveltekit-preload-data="false">
	<!-- Sidebar -->
	<UserSideBar {isLoggedIn} {username} {worlds} userWorlds={folderWorldsStructure} />

	<!-- Main content - takes full width when sidebar is closed -->
	<div class="z-40 flex flex-col flex-1 w-full transition-all duration-300 ease-in-out 
		{$sidebarOpen ? 'md:ml-64' : 'ml-0'}">
		<Navbar class="!bg-slate-800">
			<div class="flex items-center">
				<!-- Toggle button with appropriate icon -->
				<Button class="mr-2" pill size="sm" color="dark" onclick={toggleSidebar}>
					{#if $sidebarOpen}
						<CloseOutline></CloseOutline>
					{:else}
						<BarsOutline></BarsOutline>
					{/if}
				</Button>
				<NavBrand href="/">
					<span class="self-center whitespace-nowrap text-xl font-semibold text-white">Starot Wiki</span>
				</NavBrand>
			</div>

			<div class="flex self-center w-1/2">
				<div class="flex flex-wrap items-center gap-2 bg-white rounded-lg p-2 flex-1">
					{#each searchTerms as term, index}
						<span class="bg-slate-200 px-2 py-1 rounded-full text-sm flex items-center gap-1">
							{term}
							<button class="hover:text-red-500" onclick={() => removeSearchTerm(index)}>×</button>
						</span>
					{/each}
					<input
						type="text"
						class="flex-1 outline-none min-w-[100px]"
						bind:value={currentInput}
						onkeydown={addSearchTerm}
						placeholder="Buscar..."
					/>
				</div>
				<Button onclick={search}
					class="p-2.5! rounded-lg rounded-s-none" color="dark">
					<SearchOutline class="w-6 h-6" />
				</Button>
			</div>
			
			<div class="flex md:order-2">
				<Button outline pill color="dark"
				onclick={() => navigator.clipboard.writeText(window.location.href)}>
					<PaperClipOutline class="w-6 h-6 rotate-45" />
				</Button>
			</div>
		</Navbar>

		<main class="flex-1 overflow-y-auto p-4 bg-slate-900">
			<div class="bg-slate-700 rounded-lg m-2 p-6">
				{#if page.url.pathname !== '/'}
					<Button color="dark" class="mb-8"
					onclick={handleBack}>
						<ArrowLeftOutline
						></ArrowLeftOutline>
					</Button>
				{/if}
				<slot {isLoggedIn} />
			</div>
		</main>
		<Notification />
	</div>

	<div class="md:hidden">
        <MobileDrawer {isLoggedIn} {username} {worlds} userWorlds={folderWorldsStructure} />
    </div>
</div>
<Loading></Loading>