import { getWorldByUniqueName, getWorldItems } from "$lib/database/world";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createRootFolder } from "$lib/database/folder";
import { uploadFile } from "$lib/images/r2";
import { IMAGES_BASE_URL } from "$env/static/private";
import { createItem } from "$lib/database/item";
import { formatStringForURL } from "$lib/utils/formatUrl";
import { createImage } from "$lib/database/image";
import { associateTagsToItem } from "$lib/database/tags";
import { currentWorld } from "$lib/stores/world";
import { get } from "svelte/store";

export const load: PageServerLoad = async ({ params, url, platform, cookies }) => {
    // @ts-ignore
    const worldUniqueName: string = params.world; 

    if (!platform) {
        throw new Error('no platform loaded');
    }

    const DB = platform.env.DB;

    const world = await getWorldByUniqueName(DB, worldUniqueName);
    currentWorld.set(world);
    console.log('currentWorldStore ', world);

    const worldItems = await getWorldItems(DB, world.id);

    const folders: LinkItem[] = [];
    const entries: PreviewData[] = [];
    const images: PreviewData[] = [];

    //console.log('worldItems', worldItems);
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
                    preview: item.preview as string
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
    
    const folderData: FolderData = {
        folders,
        images,
        entries
    }

    return folderData;
}

export const actions: Actions = {
    newFolder: async ({ request, platform, locals, params }) => {
        const world = get(currentWorld);

        if (!world || !locals.userId) {
            throw new Error('necessary variables not set on action');
        }

        if (world.userId !== locals.userId) {
            throw new Error('no permissions to create here for the user');
        }
    
        if (!platform) {
            throw new Error('no platform loaded');
        }
        
        const DB = platform.env.DB;

        const data = await request.formData();

        const newFolderName = data.get('newFolderName') as string;

        await createRootFolder(DB, newFolderName, world.id);
        
        return { success: true };
    },
    newImage: async ({ request, platform, locals }) => {
        const world = get(currentWorld);

        if (world === null || !locals.userId) {
            throw new Error('necessary variables not set on action');
        }

        if (world.userId !== locals.userId) {
            throw new Error('no permissions to create here for the user');
        }
    
        if (!platform) {
            throw new Error('no platform loaded');
        }
        
        const DB = platform.env.DB;
        const R2BUCKET = platform.env.BUCKET;
        
        const data = await request.formData();
        const imageName = data.get('newImageName') as string;
        const imageUniqueName = formatStringForURL(imageName);
        const tags = JSON.parse(data.get('tags') as string || '[]');
        const imgFile = data.get('image') as File;
        const r2Key = 
        `${world.uniqueName}/${imageUniqueName}`;
        
        const finalImagePath = await uploadFile(R2BUCKET, r2Key, imgFile);

        const itemId = await createItem(DB, {
            name: imageName,
            uniqueName: imageUniqueName,
            type: 'image',
            worldId: world.id
        });

        await associateTagsToItem(DB, itemId, tags.map((tag: any) => tag.name ));

        await createImage(DB, itemId, finalImagePath);

        return { success: true }
    }
}