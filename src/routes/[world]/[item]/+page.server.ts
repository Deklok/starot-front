import type { PageServerLoad } from "../../$types";


export const load: PageServerLoad = async ({ params, url, platform, cookies }) => {
    
    // @ts-ignore
    const slug: string = params.world; 
    console.log(slug);

    const images = [];
    for (let i = 0; i < 5; i++) {
        images.push({ name: 'Some piece', url: '/image/pay', preview: '/pay.png' });
    }
    for (let i = 0; i < 5; i++) {
        images.push({ name: 'Some other', url: '/image/urusaipay', preview: '/payalt.png' });
    }

    const characters = [];
    for (let i = 0; i < 10; i++) {
        characters.push({ name: 'Pay', url: '/character/pay', preview: '/pay.png' });
    }
    for (let i = 0; i < 5; i++) {
        characters.push({ name: 'Nadira', url: '/character/nadira', preview: '/nadira.jpeg' });
    }

    const folders = [];
    for (let i = 0; i < 2; i++) {
        folders.push({ name: 'LGBT Folder', url: '/someid'});
        folders.push({ name: 'Furry folder', url: '/someid'});
        folders.push({ name: 'Random stuff', url: '/someid'});
    }
    
    const folderData: FolderData = {
        folders,
        images,
        characters
    }

    const imageData: ImageResponseData = {
        name: 'My coso favorito de pay la amo joder',
        imageUrl: '/pay.png',
        tags: [
            { name: 'Faroven', url:'/search/Faroven' },
            { name: 'Nachi', url:'/search/Faroven' },
            { name: 'Chessecake', url:'/search/Faroven' },
        ]
    };
    const entryData: EntryViewData = {
        name: 'Pay',
        tags: [],
        description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
        profileImage: '/pay.png',
        images: [
            { name: 'Pay pay', imageUrl: '/pay.png', tags:[] },
            { name: 'Pay pay', imageUrl: '/payalt.png', tags:[] },
            { name: 'Pay pay', imageUrl: '/paypay.jpg', tags:[] },
            { name: 'Pay pay', imageUrl: '/maspay.png', tags:[] },
            { name: 'Pay pay', imageUrl: '/payfull.jpg', tags:[] },
            { name: 'Pay pay', imageUrl: '/payyobs.jpg', tags:[] }
        ],
        sections: [
            { title: 'Resumen', content: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.` }
        ]
    };

    let finalResponse;
    console.log(url.searchParams);
    const typeItem = url.searchParams.get('type') || 'entry';
    switch(typeItem) {
        case 'folder':
            finalResponse = folderData;
            break;

        case 'image':
            finalResponse = imageData;
            break;

        case 'entry':
            finalResponse = entryData;
            break;

        default:
            console.log('type not found, default to entry');
            break;
    }

    return {...finalResponse, type: typeItem};
}