<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import { Button, Navbar, NavBrand } from 'flowbite-svelte';
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import UserSideBar from '$lib/components/UserSideBar.svelte';
	import { AngleLeftOutline, AngleRightOutline, PaperClipOutline } from 'flowbite-svelte-icons';
	import { page } from '$app/state';
	import Notification from '$lib/components/Notification.svelte';
	import { notification } from '$lib/stores/notification';

	const { username, isLoggedIn, worlds } = page.data;

	// Toggle sidebar function
	function toggleSidebar() {
		$sidebarOpen = !$sidebarOpen;
	}
	
	// Handle window resize
	function handleResize() {
		$sidebarOpen = window.innerWidth >= 768;
	}

	$: isNotificationOpen = $notification.isOpen;
	$: isNotificationError = $notification.isError;
	$: notificationMessage = $notification.message;
	
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
</script>

<div class="flex h-screen overflow-hidden" data-sveltekit-preload-data="false">
	<!-- Sidebar -->
	<UserSideBar {isLoggedIn} {username} {worlds} />

	<!-- Main content - takes full width when sidebar is closed -->
	<div class="z-40 flex flex-col flex-1 w-full transition-all duration-300 ease-in-out 
		{$sidebarOpen ? 'md:ml-64' : 'ml-0'}">
		<Navbar class="!bg-slate-800">
			<div class="flex items-center">
				<!-- Toggle button with appropriate icon -->
				<Button class="mr-2" pill size="sm" on:click={toggleSidebar}>
					{#if $sidebarOpen}
						<AngleLeftOutline></AngleLeftOutline>
					{:else}
						<AngleRightOutline></AngleRightOutline>
					{/if}
				</Button>
				<NavBrand href="/">
					<span class="self-center whitespace-nowrap text-xl font-semibold text-white">Starot Wiki</span>
				</NavBrand>
			</div>
			
			<div class="flex md:order-2">
				<Button outline pill
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
		<Notification isOpen={isNotificationOpen} 
		isError={isNotificationError} message={notificationMessage} />
	</div>
</div>