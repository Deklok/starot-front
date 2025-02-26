import { getWorldByUniqueName, getWorldItems } from "$lib/database/world";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";
import { createRootFolder } from "$lib/database/folder";


var currentWorld: World | null = null;

export const load: PageServerLoad = async ({ params, url, platform, cookies }) => {
    
    // @ts-ignore
    const worldUniqueName: string = params.world; 
    console.log('current world ', worldUniqueName);

    if (!platform) {
        throw new Error('no platform loaded');
    }

    const DB = platform.env.DB;

    const world = await getWorldByUniqueName(DB, worldUniqueName);
    currentWorld = world;

    const worldItems = await getWorldItems(DB, world.id);

    const folders: LinkItem[] = [];
    const entries: PreviewData[] = [];
    const images: PreviewData[] = [];

    console.log('worldItems', worldItems);
    worldItems.forEach(item => {
        switch(item.type) {
            case 'folder':
                folders.push({
                    name: item.name,
                    url: `${worldUniqueName}/${item.uniqueName}?type=folder`
                });
                break;

            case 'image':
                images.push({
                    name: item.name,
                    url: `${worldUniqueName}/${item.uniqueName}?type=image`,
                    preview: '/pay.png'
                });
                break;

            case 'entry':
                entries.push({
                    name: item.name,
                    url: `${worldUniqueName}/${item.uniqueName}`,
                    preview: '/pay.png'
                });
                break;

            default:
                break;
        }
    });

    console.log({
        folders,
        images,
        entries
    });
    
    const folderData: FolderData = {
        folders,
        images,
        entries
    }

    return folderData;
}

export const actions: Actions = {
    newFolder: async ({ request, platform, locals, params }) => {
        console.log('checking current world variable ', currentWorld);

        if (!currentWorld || !locals.userId) {
            throw new Error('necessary variables not set on action');
        }

        if (currentWorld.userId !== locals.userId) {
            throw new Error('no permissions to create here for the user');
        }
    
        if (!platform) {
            throw new Error('no platform loaded');
        }
        
        const DB = platform.env.DB;

        const data = await request.formData();

        const newFolderName = data.get('newFolderName') as string;

        await createRootFolder(DB, newFolderName, currentWorld.id);
        
        return { success: true };
    }
}