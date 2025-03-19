import { getFolderStructure } from "$lib/database/folder";
import { getWorlds } from "$lib/database/world";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad =  async ({ 
    platform, locals
}) => {
    if (!platform) {
        throw new Error('no platform loaded');
    }

    let username = 'Invitado';
    let isLoggedIn = false;
    if (locals.userId) {
        username = locals.username as string;
        isLoggedIn = true;
    }

    const DB = platform.env.DB;
    const worlds = await getWorlds(DB);

    const userWorlds = worlds.filter(world => world.userId === locals.userId);
    const folderWorldsStructure = await Promise.all(
        userWorlds.map(
            async (world) => ({
                id: world.id,
                name: world.name,
                children: await getFolderStructure(DB, world.id),
                uniqueName: world.uniqueName
            })
        ));
    const otherWorlds = worlds.filter(world => world.userId !== locals.userId);

    return {
        username,
        isLoggedIn,
        userWorlds: userWorlds,
        folderWorldsStructure,
        worlds: otherWorlds
    };
}