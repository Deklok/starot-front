import { getEntry } from "$lib/database/entry";
import { getFolderItems } from "$lib/database/folder";
import { getImageForItem, createImage } from "$lib/database/image";
import { getItem, createItem } from "$lib/database/item";
import { getItemTags, associateTagsToItem, updateItemTags } from "$lib/database/tags";
import { redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { get } from "svelte/store";
import { currentWorld } from "$lib/stores/world";
import { getWorldByUniqueName } from "$lib/database/world";
import { formatStringForURL } from "$lib/utils/formatUrl";
import { uploadFile } from "$lib/images/r2";
import { isLoading } from "$lib/stores/loading";
import { currentItem } from "$lib/stores/item";

export const load: PageServerLoad = async ({ params, url, platform, locals }) => {
    isLoading.set(true);
    // @ts-ignore
    const worldUniqueName: string = params.world; 

    const itemUniqueName: string = params.item; 

    if (!platform) {
        throw new Error('no platform loaded');
    }

    const DB = platform.env.DB;

    let world = get(currentWorld);
    if (world === null || world.uniqueName !== worldUniqueName) {
        world = await getWorldByUniqueName(DB, worldUniqueName);
        currentWorld.set(world);
    }

    const canEdit = world.userId === locals.userId;
    const typeItem = url.searchParams.get('type') || 'entry';
    const parentIdParam = url.searchParams.get('parentId');
    let parentId = (parentIdParam) ? Number(parentIdParam) : undefined;

    let finalResponse;
    switch(typeItem) {
        case 'folder':
            const currentFolder = await getItem(
                DB, 
                worldUniqueName, 
                itemUniqueName,
                'folder',
                parentId
            );
            currentItem.set(currentFolder);
            const folderTags = await getItemTags(DB, currentFolder.id);
            const folderItems = await getFolderItems(
                DB, 
                world.id,
                currentFolder.id
            );
        
            const folders: LinkItem[] = [];
            const entries: PreviewData[] = [];
            const images: PreviewData[] = [];

            folderItems.forEach(item => {
                switch(item.type) {
                    case 'folder':
                        folders.push({
                            name: item.name,
                            url: `/${worldUniqueName}/${item.uniqueName}?parentId=${currentFolder.id}&type=folder`
                        });
                        break;

                    case 'image':
                        images.push({
                            id: item.id,
                            name: item.name,
                            url: `/${worldUniqueName}/${item.uniqueName}?parentId=${currentFolder.id}&type=image`,
                            preview: item.preview as string
                        });
                        break;

                    case 'entry':
                        entries.push({
                            id: item.id,
                            name: item.name,
                            url: `/${worldUniqueName}/${item.uniqueName}?parentId=${currentFolder.id}`,
                            preview: item.entryPreview as string
                        });
                        break;

                    default:
                        break;
                }
            });
            
            const folderData: FolderData = {
                name: currentFolder.name,
                tags: folderTags.map((tag) => ({
                    name: tag,
                    url: `/search?tag=${tag}`
                })),
                folders,
                images,
                entries
            }
            
            finalResponse = folderData;
            break;

        case 'image':
            
            const currentImage = await getItem(
                DB, 
                worldUniqueName,
                itemUniqueName,
                'image',
                parentId
            );
            currentItem.set(currentImage);
            const imageUrl = await getImageForItem(DB, currentImage.id);
            const imageTags = await getItemTags(DB, currentImage.id);
            const imageData: ImageResponseData = {
                name: currentImage.name,
                imageUrl,
                tags: imageTags.map((tag) => ({
                    name: tag,
                    url: `/search?tag=${tag}`
                }))
            }
            finalResponse = imageData;
            break;

        case 'entry':
            const currentEntry = await getItem(
                DB, 
                worldUniqueName,
                itemUniqueName,
                'entry',
                parentId
            );
            currentItem.set(currentEntry);
            const entryTags = await getItemTags(DB, currentEntry.id);
            const entry = await getEntry(
                DB,
                currentEntry.id
            );
            const entryData: EntryViewData = {
                name: entry.name,
                entryImage: entry.imageUrl,
                tags: entryTags.map((tag) => ({
                    name: tag,
                    url: ''
                })),
                profileSections: entry.attributes.map((a) => ({
                    label: a.label,
                    value: a.value
                })),
                images: entry.images.map((img) => ({
                    imageUrl: img.filePath,
                    name: '',
                    tags: []
                })),
                sections: entry.sections.map((sec) => ({
                    title: sec.title,
                    content: sec.content
                })),
                updatedAt: entry.updatedAt
            }
            finalResponse = entryData;
            break;

        default:

            break;
    }
    isLoading.set(false);
    
    // Check if private or nsfw
    if (
        finalResponse && 
        finalResponse.tags &&
        finalResponse.tags.some((tag) => tag.name === 'privado' || tag.name === 'nsfw') &&
        !locals.userId
    ) {
        redirect(302, '/private');
    }
    return {...finalResponse, type: typeItem, canEdit };
}

export const actions: Actions = {
    newFolder: async ({ request, platform, locals }) => {
        const world = get(currentWorld);
        const currentItemLocal = get(currentItem);

        if (!world || !locals.userId || !currentItemLocal) {
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
            worldId: world.id,
            parentId: currentItemLocal.id
        });
        await associateTagsToItem(DB, itemId, tags.map((tag: any) => tag.name ));
        
        return { success: true };
    },
    newImage: async ({ request, platform, locals }) => {
        const world = get(currentWorld);
        const currentItemLocal = get(currentItem);

        if (world === null || !locals.userId || !currentItemLocal) {
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
        `${world.uniqueName}/${currentItemLocal.id}_${imageUniqueName}`;
        
        const finalImagePath = await uploadFile(R2BUCKET, r2Key, imgFile);

        const itemId = await createItem(DB, {
            name: imageName,
            uniqueName: imageUniqueName,
            type: 'image',
            worldId: world.id,
            parentId: currentItemLocal.id
        });

        await associateTagsToItem(DB, itemId, tags.map((tag: any) => tag.name ));

        await createImage(DB, itemId, finalImagePath);

        return { success: true }
    },
    updateTags: async ({ request, platform, locals }) => {
        const world = get(currentWorld);
        const currentItemLocal = get(currentItem);

        if (world === null || !locals.userId || !currentItemLocal) {
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
        const tags = JSON.parse(data.get('tags') as string || '[]');

        await updateItemTags(DB, currentItemLocal.id, tags.map((tag: any) => tag.name ));

        return { success: true }
    }
}