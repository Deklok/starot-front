import { selectUserById } from "$lib/database/user";
import { getWorlds } from "$lib/database/world";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad =  async ({ 
    params, url, platform, cookies, locals
}) => {
    if (!platform) {
        throw new Error('no platform loaded');
    }

    let username = 'Invitado';
    let isLoggedIn = false;
    if (locals.userId) {

        //const user = await selectUserById(DB, locals.userId);
        username = locals.username as string;
        isLoggedIn = true;
    }

    const DB = platform.env.DB;
    const worlds = await getWorlds(DB);

    return {
        username,
        isLoggedIn,
        worlds
    };
}