<script lang="ts">
	import { CloseButton, Drawer, Sidebar, SidebarGroup, SidebarItem, SidebarWrapper } from 'flowbite-svelte';
	import { sidebarOpen } from '$lib/stores/sidebarStore';
	import { GlobeSolid, HomeSolid } from 'flowbite-svelte-icons';
	import { sineIn } from 'svelte/easing';

	export let username: string;
	export let isLoggedIn: boolean;
	export let worlds: World[];

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
				{#each worlds as world}
					<SidebarItem onclick={() => ($sidebarOpen = false)}
                    label={world.name} href={`/${world.uniqueName}`} activeClass="bg-gray-700">
						<svelte:fragment slot="icon">
							<GlobeSolid
								class="h-5 w-5 text-gray-500 transition duration-75 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-white"
							/>
						</svelte:fragment>
					</SidebarItem>
				{/each}
			</SidebarGroup>
		</SidebarWrapper>
	</Sidebar>
</Drawer>
