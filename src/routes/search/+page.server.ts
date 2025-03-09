import type { PageServerLoad } from "../$types";
import { searchItems } from '$lib/database/item';

function groupItemsByWorld(itemResults: ItemSearchResult[]) {
    const worldGroups: Record<string, {
        name: string,
        folders: LinkItem[],
        entries: PreviewData[],
        images: PreviewData[],
        tags: CustomTag[]
    }> = {};

    itemResults.forEach(item => {
        // Initialize the world group if it doesn't exist
        if (!worldGroups[item.worldUniqueName]) {
            worldGroups[item.worldUniqueName] = {
                name: item.worldName,
                folders: [],
                entries: [],
                images: [],
                tags: []
            };
        }

        const currentWorld = worldGroups[item.worldUniqueName];

        switch (item.type) {
            case 'folder':
                currentWorld.folders.push({
                    name: item.name,
                    url: `${item.worldUniqueName}/${item.uniqueName}?type=folder`
                });
                break;

            case 'image':
                currentWorld.images.push({
                    name: item.name,
                    url: `${item.worldUniqueName}/${item.uniqueName}?type=image`,
                    preview: item.preview as string
                });
                break;

            case 'entry':
                currentWorld.entries.push({
                    name: item.name,
                    url: `${item.worldUniqueName}/${item.uniqueName}`,
                    preview: item.entryPreview as string
                });
                break;

            default:
                break;
        }
    });

    return Object.values(worldGroups);
}

export const load: PageServerLoad = async ({ url, platform }) => {
    if (!platform) {
        throw new Error('no platform loaded');
    }

    const DB = platform.env.DB;

    const searchTerm = url.searchParams.get('query');
    const tag = url.searchParams.get('tag');

    const itemResults = await searchItems(
        DB,
        {
            searchTerm: searchTerm ? searchTerm : undefined,
            tags: tag ? [tag] : []
        }
    )
    
    const results = groupItemsByWorld(itemResults);

    return {
        itemsByWorld: results
    };
}