<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import {
		Sidebar as FlowbiteSidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper
	} from 'flowbite-svelte';
	import {
		GlobeSolid,
		HomeSolid
	} from 'flowbite-svelte-icons';

	// Sample user data (replace with your actual user data)
	export let username: string;
	export let isLoggedIn: boolean;
	export let worlds: World[];
	export let userWorlds: World[];
</script>

<!-- Sidebar with fixed positioning and dark theme to match your screenshot -->
<div data-sveltekit-preload-data="false"
	class="transition-all duration-300 ease-in-out fixed top-0 left-0 z-40 h-full 
           {$sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 md:w-0'}">
	<FlowbiteSidebar class="h-full">
		<SidebarWrapper class="!bg-slate-800 text-white h-full">
			<!-- User Profile Section -->
			<div class="p-4 border-gray-700">
				<div class="flex items-center space-x-4">
					<div class="font-medium">
						<div class="text-white text-2xl">{username}</div>
						{#if !isLoggedIn}
							<a href="/login"> Iniciar sesion </a>
						{/if}
					</div>
				</div>
			</div>
			
			<!-- Sidebar Navigation -->
			<SidebarGroup>
				<SidebarItem label="Home" href={`/`}
				activeClass="bg-gray-700" class="text-white hover:bg-gray-700">
					<svelte:fragment slot="icon">
						<HomeSolid class="text-gray-300" />
					</svelte:fragment>
				</SidebarItem>		
			</SidebarGroup>
			<SidebarGroup border>
				<div class="py-3 px-2 text-gray-300">Mis mundos</div>
				{#each userWorlds as world}
				<SidebarItem href={`/${world.uniqueName}`}
				activeClass="bg-gray-700" class="text-white hover:bg-gray-700">
					<svelte:fragment slot="icon">
						<GlobeSolid class="text-gray-300" />
					</svelte:fragment>
					<svelte:fragment slot="subtext">
						<div class="flex flex-col w-fit">
							<div class="text-lg block" > {world.name} </div>
						</div>	
					</svelte:fragment>
				</SidebarItem>	
				{/each}
			</SidebarGroup>			
			<SidebarGroup border>							
				<div class="py-3 px-2 text-gray-300">Otros mundos</div>
				{#each worlds as world}
				<SidebarItem href={`/${world.uniqueName}`}
				activeClass="bg-gray-700" class="text-white hover:bg-gray-700">
					<svelte:fragment slot="icon">
						<GlobeSolid class="text-gray-300" />
					</svelte:fragment>
					<svelte:fragment slot="subtext">
						<div class="flex flex-col w-fit">
							<div class="text-lg block" > {world.name} </div>
							<div class="text-[0.7rem] italic block"> {world.createdBy}</div>
						</div>
					</svelte:fragment>
				</SidebarItem>					
				{/each}
			</SidebarGroup>
		</SidebarWrapper>
	</FlowbiteSidebar>
</div>

<!-- Overlay to close sidebar on mobile when it's open -->
{#if $sidebarOpen}
	<div 
		class="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
		on:click={() => $sidebarOpen = false}
	></div>
{/if}