<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { Button, Navbar, NavBrand } from 'flowbite-svelte';
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import UserSideBar from '$lib/components/UserSideBar.svelte';
	import { ArrowLeftOutline, BarsOutline, PaperClipOutline, SearchOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/state';
	import Notification from '$lib/components/Notification.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import MobileDrawer from '$lib/components/MobileDrawer.svelte';
	import { goto } from '$app/navigation';

	const username = $derived(page.data.username);
	const isLoggedIn = $derived(page.data.isLoggedIn);
	const worlds = $derived(page.data.worlds);
	const folderWorldsStructure = $derived(page.data.folderWorldsStructure);
	
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

    let currentInput: string = $state('');

    // Modified search function to handle single term
    function search() {
        if (currentInput.trim()) {
            goto(`/search?query=${currentInput}`);
        }
    }

    // Add new term from input
    function handleSearch(event: KeyboardEvent) {
        if (event.key === 'Enter' && currentInput.trim()) {
            search();
        }
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
				{#if !$sidebarOpen}
					<Button class="mr-2" pill size="sm" color="dark" onclick={toggleSidebar}>
						<BarsOutline></BarsOutline>
					</Button>
				{/if}
				<Button color="dark" class="mr-2"
				onclick={handleBack} size="lg">
					<ArrowLeftOutline size="lg"
					></ArrowLeftOutline>
				</Button>
				<NavBrand href="/">
					<span class="self-center whitespace-nowrap text-xl font-semibold text-white">Starot Wiki</span>
				</NavBrand>
			</div>

			<div class="flex self-center w-1/2">
				<div class="flex flex-wrap items-center gap-2 bg-white rounded-lg p-2 flex-1">
					<input
						type="text"
						class="w-full text-gray-900
						bg-transparent border-none"
						bind:value={currentInput}
						onkeydown={handleSearch}
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