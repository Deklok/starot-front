import { getFolder, getFolderItems } from "$lib/database/folder";
import type { PageServerLoad } from "./$types";

var currentItem: Item | null = null;

export const load: PageServerLoad = async ({ params, url, platform, cookies }) => {
   
    // @ts-ignore
    const worldUniqueName: string = params.world; 
    console.log('current world', worldUniqueName);
    const itemUniqueName: string = params.item; 

    if (!platform) {
        throw new Error('no platform loaded');
    }

    const DB = platform.env.DB;

    console.log(url.searchParams);
    const typeItem = url.searchParams.get('type') || 'entry';

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
        profileSections: [],
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
    switch(typeItem) {
        case 'folder':
            const currentFolder = await getFolder(DB, worldUniqueName, itemUniqueName);
            currentItem = currentFolder;
            const folderItems = await getFolderItems(DB, currentFolder.id);
        
            const folders: LinkItem[] = [];
            const entries: PreviewData[] = [];
            const images: PreviewData[] = [];
            
            console.log('folderItems', folderItems);

            folderItems.forEach(item => {
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
                            preview: '/pay.png'
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