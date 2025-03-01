import { currentWorld } from "$lib/stores/world";
import { get } from "svelte/store";
import type { PageServerLoad } from "./$types";
import { getWorldByUniqueName } from "$lib/database/world";
import type { Actions } from "@sveltejs/kit";

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
        profileImage: '',
        images: [],
        sections: [
            { title: 'Resumen', content: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.` }
        ]
    };

    return {
        entryData,
        uniqueName: null
    };
}

export const actions: Actions = {
    newEntry: async ( {request, platform, locals} ) => {
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
    }
}