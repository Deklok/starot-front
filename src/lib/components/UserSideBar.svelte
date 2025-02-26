<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import {
		Sidebar as FlowbiteSidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		SidebarDropdownItem,
		SidebarDropdownWrapper

	} from 'flowbite-svelte';
	import {
		ProfileCardOutline,
		ArchiveSolid,
		HomeSolid,
		UsersSolid,
		SearchOutline,
		CogSolid
	} from 'flowbite-svelte-icons';

	// Sample user data (replace with your actual user data)
	export let username: string;
	export let isLoggedIn: boolean;
</script>

<!-- Sidebar with fixed positioning and dark theme to match your screenshot -->
<div 
	class="transition-all duration-300 ease-in-out fixed top-0 left-0 z-40 h-full 
           {$sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 md:w-0'}">
	<FlowbiteSidebar class="h-full">
		<SidebarWrapper class="!bg-slate-800 text-white h-full">
			<!-- User Profile Section -->
			<div class="p-4 border-b border-gray-700">
				<div class="flex items-center space-x-4">
					<div class="font-medium">
						<div class="text-white text-2xl">{username}</div>
						{#if !isLoggedIn}
							<a href="/login"> Iniciar sesion </a>
						{/if}
					</div>
				</div>
			</div>

			<!-- Navigation items with dark theme styling -->
			<SidebarGroup>
				<SidebarItem label="Home" href="/"
				             activeClass="bg-gray-700" class="text-white hover:bg-gray-700">
					<svelte:fragment slot="icon">
						<HomeSolid class="text-gray-300" />
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem label="Users" href="/users"
				             activeClass="bg-gray-700" class="text-white hover:bg-gray-700">
					<svelte:fragment slot="icon">
						<UsersSolid class="text-gray-300" />
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem label="Search" href="/search"
				             activeClass="bg-gray-700" class="text-white hover:bg-gray-700">
					<svelte:fragment slot="icon">
						<SearchOutline class="text-gray-300" />
					</svelte:fragment>
				</SidebarItem>
			</SidebarGroup>

			<SidebarGroup>
				<SidebarItem label="Profile" class="text-white hover:bg-gray-700">
					<svelte:fragment slot="icon">
						<ProfileCardOutline class="text-gray-300" />
					</svelte:fragment>
				</SidebarItem>
				<SidebarDropdownWrapper label="Pages" class="text-white hover:bg-gray-700">
					<svelte:fragment slot="icon">
						<ArchiveSolid class="text-gray-300" />
					</svelte:fragment>
					<SidebarDropdownItem label="Settings" href="/settings" class="text-white hover:bg-gray-700" />
					<SidebarDropdownItem label="Kanban" href="/kanban" class="text-white hover:bg-gray-700" />
					<SidebarDropdownItem label="Calendar" href="/calendar" class="text-white hover:bg-gray-700" />
				</SidebarDropdownWrapper>
			</SidebarGroup>

			<SidebarGroup border borderClass="border-gray-700">
				<SidebarItem label="Settings" href="/settings"
				             activeClass="bg-gray-700" class="text-white hover:bg-gray-700">
					<svelte:fragment slot="icon">
						<CogSolid class="text-gray-300" />
					</svelte:fragment>
				</SidebarItem>
				<SidebarItem label="Help" href="/help"
				             activeClass="bg-gray-700" class="text-white hover:bg-gray-700">
					<svelte:fragment slot="icon">
						<svg
							aria-hidden="true"
							class="flex-shrink-0 w-6 h-6 text-gray-300 transition duration-75 group-hover:text-white"
							fill="currentColor"
							viewBox="0 0 20 20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z"
								clip-rule="evenodd"
							/>
						</svg>
					</svelte:fragment>
				</SidebarItem>
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