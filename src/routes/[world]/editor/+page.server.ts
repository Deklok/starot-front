import { currentWorld } from "$lib/stores/world";
import { get } from "svelte/store";
import type { PageServerLoad } from "./$types";
import { getWorldByUniqueName } from "$lib/database/world";
import { redirect, type Actions } from "@sveltejs/kit";
import { createItem } from "$lib/database/item";
import { formatStringForURL } from "$lib/utils/formatUrl";
import { uploadFile } from "$lib/images/r2";
import { createEntry } from "$lib/database/entry";
import { associateTagsToItem } from "$lib/database/tags";

var parentId: number | null;

export const load: PageServerLoad = async ({ params, url, platform, locals }) => {
    const worldUniqueName = params.world;
    let world = get(currentWorld);

    if (!platform) {
        throw new Error('no platform loaded');
    }

    const DB = platform.env.DB;

    if (world === null || world.uniqueName !== worldUniqueName) {
        world = await getWorldByUniqueName(DB, worldUniqueName);
        currentWorld.set(world);
    }

    if (world.userId !== locals.userId) {
        throw new Error(`user can't create entry here`);
    }

    console.log(url.searchParams);
    let queryParentId = url.searchParams.get('parentId');
    parentId = (queryParentId === null) ? null : Number(parentId);

    const entryData: EntryViewData = {
        
    } as EntryViewData;

    return {
        entryData,
        uniqueName: null
    };
}

export const actions: Actions = {
    newEntry: async ({ request, platform, locals }) => {
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
        console.log('data recieved', data);

        const name = data.get('name') as string;
        const tags = JSON.parse(data.get('tags') as string || '[]');
        const imgFile = data.get('image') as File;
        const profileSections = JSON.parse(data.get('profile_sections') as string || '[]');
        const sections = JSON.parse(data.get('sections') as string || '[]');
        
        let entryImages: File[] = [];
        for (const [key, value] of data.entries()) {
            if (key.startsWith('entry_image_file_')) {
                entryImages.push(value as File);
            }
        }
        const entryUniqueName = formatStringForURL(name);

        const itemId = await createItem(DB, {
            name,
            uniqueName: entryUniqueName,
            type: 'entry',
            worldId: world.id,
            parentId: (parentId) ? parentId : undefined
        });

        await associateTagsToItem(DB, itemId, tags.map((tag: any) => tag.name ));

        // Upload images from the entry
        const mainEntryImage = await uploadFile(
            R2BUCKET,
            `${world.uniqueName}/${entryUniqueName}/main`,
            imgFile
        );

        let entryImagesUrl: string[] = [];
        await Promise.all(entryImages.map( async (image, index) => {
            const imgUrl = await uploadFile(
                R2BUCKET,
                `${world.uniqueName}/${entryUniqueName}/${entryUniqueName}-${index + 1}`,
                image
            );
            entryImagesUrl.push(imgUrl);
        }));

        await createEntry(DB, itemId, {
            itemId,
            name,
            image: mainEntryImage,
            attributes: profileSections.map((a: any, i: number) => ({
                label: a.label,
                value: a.value,
                displayOrder: i
            })),
            images: entryImagesUrl.map((img, i) => ({
                filePath: img,
                displayOrder: i
            })),
            sections: sections.map((s: any, i: number) => ({
                title: s.title,
                content: s.content,
                displayOrder: i
            }))
        });

        return redirect(303, `${world.uniqueName}/${entryUniqueName}`);
    }
}