<script lang="ts">
	import { CloseButton, Drawer, Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import { GlobeSolid, HomeSolid } from 'flowbite-svelte-icons';
	import { sineIn } from 'svelte/easing';

	export let username: string;
	export let isLoggedIn: boolean;
	export let worlds: World[];
	export let userWorlds: World[];

    let transitionParams = {
        x: -320,
        duration: 200,
        easing: sineIn
    };

	$: sidebarOpen
</script>

<Drawer hidden={!$sidebarOpen} transitionType="fly" {transitionParams}
placement="left" backdrop={false} activateClickOutside={false}>
	<div class="flex justify-around">
        <span class="text-2xl font-medium text-white">
            {username}
        </span>
        <CloseButton on:click={() => ($sidebarOpen = false)} class="mb-4 dark:text-white" />
    </div>
    {#if !isLoggedIn}
		<a class="text-white" onclick={() => ($sidebarOpen = false)}
        href="/login"> Iniciar sesion </a>
	{/if}
	<Sidebar>
		<SidebarWrapper>
			<SidebarGroup>
				<SidebarItem onclick={() => ($sidebarOpen = false)}
                label="Home" href={`/`} activeClass="bg-gray-700">
					<svelte:fragment slot="icon">
						<HomeSolid
							class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
						/>
					</svelte:fragment>
				</SidebarItem>
			</SidebarGroup>
			<SidebarGroup border>
				<div class="py-3 px-2 text-gray-300">Mis mundos</div>
				{#each userWorlds as world}
					<SidebarItem onclick={() => ($sidebarOpen = false)}
                    href={`/${world.uniqueName}`} activeClass="bg-gray-700">
						<svelte:fragment slot="icon">
							<GlobeSolid
								class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
							/>
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
					<SidebarItem onclick={() => ($sidebarOpen = false)}
                    href={`/${world.uniqueName}`} activeClass="bg-gray-700">
						<svelte:fragment slot="icon">
							<GlobeSolid
								class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
							/>
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
	</Sidebar>
</Drawer>
