<script lang="ts">
	import { page } from '$app/stores';
	import {
		Sidebar,
		SidebarGroup,
		SidebarItem,
		SidebarWrapper,
		SidebarDropdownItem,
		SidebarDropdownWrapper
	} from 'flowbite-svelte';
	import {
		ProfileCardOutline,
		ArchiveSolid
	} from 'flowbite-svelte-icons'
	let spanClass = 'flex-1 ml-3 whitespace-nowrap';
	$: activeUrl = $page.url.pathname;
</script>

<Sidebar>
	<SidebarWrapper class="bg-white">
		<SidebarGroup>
			<SidebarItem label="Profile">
				<svelte:fragment slot="icon">
					<ProfileCardOutline/>
				</svelte:fragment>
			</SidebarItem>
			<SidebarDropdownWrapper label="Pages">
				<svelte:fragment slot="icon">
					<ArchiveSolid/>
				</svelte:fragment>
				<SidebarDropdownItem label="Settings" href="/" />
				<SidebarDropdownItem label="Kanban" href="/" />
				<SidebarDropdownItem label="Calendar" href="/" />
			</SidebarDropdownWrapper>
		</SidebarGroup>
		<SidebarGroup border>
			<SidebarItem label="Settings" {spanClass}>
				<svelte:fragment slot="icon">
					<svg
						aria-hidden="true"
						class="flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path
							fill-rule="evenodd"
							d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
							clip-rule="evenodd"
						/></svg
					>
				</svelte:fragment>
			</SidebarItem>
			<SidebarItem label="Drogas" href="/" active={activeUrl === '/components/sidebar'}>
				<svelte:fragment slot="icon">
					<svg
						aria-hidden="true"
						class="flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path
							d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"
						/></svg
					>
				</svelte:fragment>
			</SidebarItem>
			<SidebarItem label="Aiuda (auxilio)" href="/">
				<svelte:fragment slot="icon">
					<svg
						aria-hidden="true"
						class="flex-shrink-0 w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
						><path
							fill-rule="evenodd"
							d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0 .993-.241 1.929-.668 2.754l-1.524-1.525a3.997 3.997 0 00.078-2.183l1.562-1.562C15.802 8.249 16 9.1 16 10zm-5.165 3.913l1.58 1.58A5.98 5.98 0 0110 16a5.976 5.976 0 01-2.516-.552l1.562-1.562a4.006 4.006 0 001.789.027zm-4.677-2.796a4.002 4.002 0 01-.041-2.08l-.08.08-1.53-1.533A5.98 5.98 0 004 10c0 .954.223 1.856.619 2.657l1.54-1.54zm1.088-6.45A5.974 5.974 0 0110 4c.954 0 1.856.223 2.657.619l-1.54 1.54a4.002 4.002 0 00-2.346.033L7.246 4.668zM12 10a2 2 0 11-4 0 2 2 0 014 0z"
							clip-rule="evenodd"
						/></svg
					>
				</svelte:fragment>
			</SidebarItem>
		</SidebarGroup>
	</SidebarWrapper>
</Sidebar>
