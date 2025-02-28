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


var currentWorld: World | null = null;

export const load: PageServerLoad = async ({ params, url, platform, cookies }) => {
    
    // @ts-ignore
    const worldUniqueName: string = params.world; 
    console.log('current world', worldUniqueName);

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
    },
    newImage: async ({ request, platform, locals }) => {
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
        const R2BUCKET = platform.env.BUCKET;
        
        const data = await request.formData();
        const imageName = data.get('newImageName') as string;
        const imageUniqueName = formatStringForURL(imageName);
        const tags = JSON.parse(data.get('tags') as string || '[]');
        const imgFile = data.get('image') as File;
        const imgExt = imgFile.name.split('.')[1];
        const filePath = 
        `${currentWorld.uniqueName}/${imageUniqueName}.${imgExt}`;
        
        await uploadFile(R2BUCKET, filePath, imgFile);

        const finalImagePath = `${IMAGES_BASE_URL}/${filePath}`;

        const itemId = await createItem(DB, {
            name: imageName,
            uniqueName: imageUniqueName,
            type: 'image',
            worldId: currentWorld.id
        });

        await associateTagsToItem(DB, itemId, tags.map((tag: any) => tag.name ));

        await createImage(DB, itemId, finalImagePath);

        return { success: true }
    }
}