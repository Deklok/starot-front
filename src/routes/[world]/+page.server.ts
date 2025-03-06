import { getWorldByUniqueName, getWorldItems } from "$lib/database/world";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { uploadFile } from "$lib/images/r2";
import { createItem } from "$lib/database/item";
import { formatStringForURL } from "$lib/utils/formatUrl";
import { createImage } from "$lib/database/image";
import { associateTagsToItem } from "$lib/database/tags";
import { currentWorld } from "$lib/stores/world";
import { get } from "svelte/store";
import { isLoading } from "$lib/stores/loading";

export const load: PageServerLoad = async ({ params, url, platform, cookies }) => {
    isLoading.set(true);
    // @ts-ignore
    const worldUniqueName: string = params.world; 

    if (!platform) {
        throw new Error('no platform loaded');
    }

    const DB = platform.env.DB;

    const world = await getWorldByUniqueName(DB, worldUniqueName);
    currentWorld.set(world);


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
                    preview: item.entryPreview as string
                });
                break;

            default:
                break;
        }
    });
    
    isLoading.set(false);
    const folderData: FolderData = {
        name: world.name,
        folders,
        images,
        entries
    }

    return folderData;
}

export const actions: Actions = {
    newFolder: async ({ request, platform, locals, params }) => {
        isLoading.set(true);
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
        const folderUniqueName = formatStringForURL(newFolderName);
        const tags = JSON.parse(data.get('tags') as string || '[]');

        const itemId = await createItem(DB, {
            name: newFolderName,
            uniqueName: folderUniqueName,
            type: 'folder',
            worldId: world.id
        });
        await associateTagsToItem(DB, itemId, tags.map((tag: any) => tag.name ));
        
        isLoading.set(false);
        return { success: true };
    },
    newImage: async ({ request, platform, locals }) => {
        isLoading.set(true);
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

        isLoading.set(false);
        return { success: true }
    }
}