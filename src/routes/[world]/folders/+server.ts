import { getFolderStructure, moveItemToFolder } from "$lib/database/folder";
import { currentWorld } from "$lib/stores/world";
import { json, type RequestHandler } from "@sveltejs/kit";
import { get } from "svelte/store";

export const GET: RequestHandler = async ({ params, platform }) => {
    const world = get(currentWorld);
    const worldUniqueName: string = params.world as string;

    if (world === null) {
        throw new Error('necessary variables not set on action');
    }

    if (worldUniqueName !== world.uniqueName) {
        throw new Error('world unique name does not match');
    }

    if (!platform) {
        throw new Error('no platform loaded');
    }
    
    const DB = platform.env.DB;

    let folderStructureData = await getFolderStructure(DB, world.id);

    return json(folderStructureData);
}

export const POST: RequestHandler = async ({ request, params, platform }) => {
    const world = get(currentWorld);
    if (world === null) {
        throw new Error('necessary variables not set on action');
    }

    if (!platform) {
        throw new Error('no platform loaded');
    }
    
    const DB = platform.env.DB;    
    const data = await request.formData();

    const folderId = Number(data.get('folderId') as string);
    const itemId = Number(data.get('itemId') as string);
    
    await moveItemToFolder(DB, itemId, folderId);

    return json({});
}