import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, url, platform, cookies }) => {
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

    return entryData;
}