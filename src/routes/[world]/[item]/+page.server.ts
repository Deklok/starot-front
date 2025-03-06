import { getEntry } from "$lib/database/entry";
import { getFolderItems } from "$lib/database/folder";
import { getImageForItem, createImage } from "$lib/database/image";
import { getItem, createItem } from "$lib/database/item";
import { getItemTags, associateTagsToItem } from "$lib/database/tags";
import type { Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { get } from "svelte/store";
import { currentWorld } from "$lib/stores/world";
import { getWorldByUniqueName } from "$lib/database/world";
import { formatStringForURL } from "$lib/utils/formatUrl";
import { uploadFile } from "$lib/images/r2";
import { isLoading } from "$lib/stores/loading";

var currentItem: Item | null = null;

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
            currentItem = currentFolder;
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
                            name: item.name,
                            url: `/${worldUniqueName}/${item.uniqueName}?parentId=${currentFolder.id}&type=image`,
                            preview: item.preview as string
                        });
                        break;

                    case 'entry':
                        entries.push({
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
                folders,
                images,
                entries
            }
            
            finalResponse = folderData;
            break;

        case 'image':
            currentItem = await getItem(
                DB, 
                worldUniqueName,
                itemUniqueName,
                'image',
                parentId
            );
            const imageTags = await getItemTags(DB, currentItem.id);
            const imageUrl = await getImageForItem(DB, currentItem.id);
            const imageData: ImageResponseData = {
                name: currentItem.name,
                imageUrl,
                tags: imageTags.map((tag) => ({
                    name: tag,
                    url: `/search?tag=${tag}`
                }))
            }
            finalResponse = imageData;
            break;

        case 'entry':
            currentItem = await getItem(
                DB, 
                worldUniqueName,
                itemUniqueName,
                'entry',
                parentId
            );
            const entryTags = await getItemTags(DB, currentItem.id);
            const entry = await getEntry(
                DB,
                currentItem.id
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
                }))
            }
            finalResponse = entryData;
            break;

        default:

            break;
    }

    console.log('returning from page.server ',
        {...finalResponse, type: typeItem}
    );
    isLoading.set(false);
    return {...finalResponse, type: typeItem, currentId: currentItem?.id, canEdit };
}

export const actions: Actions = {
    newFolder: async ({ request, platform, locals }) => {
        isLoading.set(true);
        const world = get(currentWorld);

        if (!world || !locals.userId || !currentItem) {
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
            parentId: currentItem.id
        });
        await associateTagsToItem(DB, itemId, tags.map((tag: any) => tag.name ));
        
        isLoading.set(false);
        return { success: true };
    },
    newImage: async ({ request, platform, locals }) => {
        isLoading.set(true);
        const world = get(currentWorld);

        if (world === null || !locals.userId || !currentItem) {
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
        `${world.uniqueName}/${currentItem.id}_${imageUniqueName}`;
        
        const finalImagePath = await uploadFile(R2BUCKET, r2Key, imgFile);

        const itemId = await createItem(DB, {
            name: imageName,
            uniqueName: imageUniqueName,
            type: 'image',
            worldId: world.id,
            parentId: currentItem.id
        });

        await associateTagsToItem(DB, itemId, tags.map((tag: any) => tag.name ));

        await createImage(DB, itemId, finalImagePath);

        isLoading.set(false);
        return { success: true }
    }
}