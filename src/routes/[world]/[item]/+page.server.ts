import { getEntry } from "$lib/database/entry";
import { getFolderItems } from "$lib/database/folder";
import { getImageForItem } from "$lib/database/image";
import { getItem } from "$lib/database/item";
import { getItemTags } from "$lib/database/tags";
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

    let finalResponse;
    switch(typeItem) {
        case 'folder':
            const currentFolder = await getItem(
                DB, 
                worldUniqueName, 
                itemUniqueName,
                'folder'
            );
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
        /*
    const imageData: ImageResponseData = {
        name: 'My coso favorito de pay la amo joder',
        imageUrl: '/pay.png',
        tags: [
            { name: 'Faroven', url:'/search/Faroven' },
            { name: 'Nachi', url:'/search/Faroven' },
            { name: 'Chessecake', url:'/search/Faroven' },
        ]
    };
    */      currentItem = await getItem(
                DB, 
                worldUniqueName,
                itemUniqueName,
                'image'
            );
            console.log('image item', currentItem);
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
                'entry'
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
            console.log('type not found, default to entry');
            break;
    }

    console.log('returning from page.server ',
        {...finalResponse, type: typeItem}
    );
    return {...finalResponse, type: typeItem};
}