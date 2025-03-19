import { getFolderStructure, moveItemToFolder } from "$lib/database/folder";
import { deleteItemById, getItem } from "$lib/database/item";
import { currentWorld } from "$lib/stores/world";
import { json, type RequestHandler } from "@sveltejs/kit";
import { get } from "svelte/store";

/* Get tree folder structure of the world  */
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

/* Move item folder request  */
export const POST: RequestHandler = async ({ request, platform }) => {
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

/* Delete item  */
export const DELETE: RequestHandler = async ({ request, platform }) => {
    if (!platform) {
        throw new Error('no platform loaded');
    }
    
    const DB = platform.env.DB;
    const BUCKET = platform.env.BUCKET;
    const data = await request.formData();

    const itemId = Number(data.get('itemId') as string);
    await deleteItemById(DB, BUCKET, itemId);
    
    return json({});
}