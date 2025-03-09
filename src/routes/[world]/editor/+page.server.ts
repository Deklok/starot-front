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
import { generateRandomId } from "$lib/utils/randomId";
import { parentId } from "$lib/stores/item";

export const load: PageServerLoad = async ({ params, url, platform, locals }) => {
    const worldUniqueName = params.world;

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
    
    parentId.set(
        (queryParentId) ? Number(queryParentId) : null
    );

    const entryData: EntryViewData = {
        name: '',
        tags: [],
        profileSections: [
            { label: 'Nombre', value: '' },
            { label: 'Apodo', value: '' },
            { label: 'Mundo', value: '' },
            { label: 'Región', value: '' },
            { label: 'Raza', value: '' },
            { label: 'Altura', value: '' },
            { label: 'Ocupaciones', value: '' },
            { label: 'Familia', value: '' },
            { label: 'Estado', value: '' },
            { label: 'Pareja', value: '' },
            { label: 'Estatus', value: '' }
        ],
        entryImage: '',
        images: [],
        sections: [
            { title: 'Resumen', content: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.` }
        ]
    } as EntryViewData;

    return {
        entryData,
        uniqueName: null
    };
}

export const actions: Actions = {
    newEntry: async ({ request, platform, locals, url }) => {
        const world = get(currentWorld);
        const currentParentId = get(parentId);

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
            parentId: currentParentId ? currentParentId : undefined
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
                `${world.uniqueName}/${entryUniqueName}/${generateRandomId()}`,
                image
            );
            entryImagesUrl.push(imgUrl);
        }));

        await createEntry(DB, itemId, {
            itemId,
            name,
            image: mainEntryImage,
            attributes: profileSections.map((a: any) => ({
                label: a.label,
                value: a.value
            })),
            images: entryImagesUrl.map((img, i) => ({
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