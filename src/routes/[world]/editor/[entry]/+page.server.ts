import { get } from "svelte/store";
import type { PageServerLoad } from "../$types";
import { currentWorld } from "$lib/stores/world";
import { getWorldByUniqueName } from "$lib/database/world";
import { getItem } from "$lib/database/item";
import { getEntry, updateEntry } from "$lib/database/entry";
import { getItemTags, updateItemTags } from "$lib/database/tags";
import { error, type Actions } from "@sveltejs/kit";
import { uploadFile } from "$lib/images/r2";
import { generateRandomId } from "$lib/utils/randomId";
import { entryId, itemId } from "$lib/stores/item";

export const load: PageServerLoad = async ({ params, url, platform, locals }) => {
    const worldUniqueName = params.world;
    // @ts-ignore
    const itemUniqueName: string = params.entry;

    if (!platform) {
        throw new Error('no platform loaded');
    }

    const DB = platform.env.DB;

    let world = get(currentWorld);
    if (world === null || world.uniqueName !== worldUniqueName) {
        world = await getWorldByUniqueName(DB, worldUniqueName);
        currentWorld.set(world);
    }

    if (world.userId !== locals.userId) {
        throw new Error(`user can't create entry here`);
    }

    let queryParentId = url.searchParams.get('parentId');
    const item = await getItem(
        DB, 
        worldUniqueName,
        itemUniqueName,
        'entry',
        (queryParentId) ? Number(queryParentId) : undefined
    );

    const tags = await getItemTags(DB, item.id);

    const entry = await getEntry(
        DB,
        item.id
    );

    entryId.set(entry.id);
    itemId.set(item.id);

    const entryData: EntryViewData = {
        name: entry.name,
        tags: tags.map((tag => ({ name: tag, url: ''}))),
        profileSections: entry.attributes,
        entryImage: entry.imageUrl,
        images: entry.images.map((image) => ({
            name: '',
            imageUrl: image.filePath,
            tags: []
        })),
        sections: entry.sections,
        updatedAt: entry.updatedAt
    } as EntryViewData;

    return {
        entryData
    };
}

export const actions: Actions = {
    newEntry: async ({ request, platform, locals, params }) => {
        const world = get(currentWorld);
        const currentEntryId = get(entryId);
        const currentItemId = get(itemId);


        if (world === null || !locals.userId || !currentEntryId || !currentItemId) {
            console.log({
                world,
                userId: locals.userId,
                entryId: currentEntryId,
                itemId: currentItemId
            });
            throw new Error('necessary variables not set on action');
        }

        if (world.userId !== locals.userId) {
            throw new Error('no permissions to edit here for the user');
        }

        if (!platform) {
            throw new Error('no platform loaded');
        }

        const DB = platform.env.DB;
        const R2BUCKET = platform.env.BUCKET;

        const data = await request.formData();

        const name = data.get('name') as string;
        const tags = JSON.parse(data.get('tags') as string || '[]');
        const imgFile = data.get('image');
        const profileSections = JSON.parse(data.get('profile_sections') as string || '[]');
        const sections = JSON.parse(data.get('sections') as string || '[]');
        
        let entryImages: (File | string)[] = [];
        for (const [key, value] of data.entries()) {
            if (key.startsWith('entry_image_file_')) {
                entryImages.push(value as File);
            }
            if (key.startsWith('entry_image_url_')) {
                entryImages.push(value as string);
            }
        }

        const entryUniqueName: string = params.entry as string;
        let mainEntryImage: string = '';

        await updateItemTags(DB, currentItemId, tags.map((tag: any) => tag.name ));

        if (imgFile instanceof File) {
            // Upload images from the entry
            mainEntryImage = await uploadFile(
                R2BUCKET,
                `${world.uniqueName}/${entryUniqueName}/main`,
                imgFile
            );
        } else {
            mainEntryImage = imgFile as string;
        }

        let entryImagesUrl: string[] = [];
        await Promise.all(entryImages.map(async (image, index) => {
            if (image instanceof File) {
                const imgUrl = await uploadFile(
                    R2BUCKET,
                    `${world.uniqueName}/${entryUniqueName}/${generateRandomId()}`,
                    image
                );
                entryImagesUrl.push(imgUrl);
            } else if (typeof image === 'string') {
                entryImagesUrl.push(image);
            }
        }));

        await updateEntry(DB, currentEntryId, {
            name,
            image: mainEntryImage,
            attributes: profileSections.map((a: any) => ({
                label: a.label,
                value: a.value
            })),
            images: entryImagesUrl.map((img) => ({
                filePath: img
            })),
            sections: sections.map((s: any) => ({
                title: s.title,
                content: s.content
            }))
        });  
        
        return { sucess: true }

    }
}