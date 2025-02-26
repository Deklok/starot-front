import { selectUserById } from "$lib/database/user";
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
        console.log('user found logged in');
        //const user = await selectUserById(DB, locals.userId);
        username = locals.username as string;
        isLoggedIn = true;
    }

    return {
        username,
        isLoggedIn
    };
}