import { fail, redirect, type Actions } from '@sveltejs/kit';
import { isLoading } from '$lib/stores/loading';
import type { PageServerLoad } from './$types';
import { createWorld, getWorlds } from '$lib/database/world';

export const load: PageServerLoad = async (
    { params, url, platform, cookies, parent }
) => {
    const parentData = await parent();

    if (!platform) {
        throw new Error('no platform loaded');
    }

    return {
        ...parentData
    }
}

export const actions = {
    newWorld: async ({ request, platform, locals }) => {
        if (!platform) {
            throw new Error('no platform loaded');
        }
        const DB = platform.env.DB;        

        const userId = locals.userId;
        if (!userId) {
            throw new Error('userId not found to create world');
        }
        isLoading.set(true);

        const data = await request.formData();

        const newWorldName = data.get('newWorldName') as string;
        
        const uniqueName = await createWorld(DB, newWorldName, userId);

        isLoading.set(false);
        return redirect(303, '/'+uniqueName);
    }
} satisfies Actions;