import type { PageServerLoad } from "../$types";
import { searchItems } from '$lib/database/item';

function orderByType(
    itemResults: ItemSearchResult[]
): {
    entries: ItemSearchResult[];
    folders: ItemSearchResult[];
    images: ItemSearchResult[];
}  {
    const finalResult: {
        entries: ItemSearchResult[];
        folders: ItemSearchResult[];
        images: ItemSearchResult[];
    } = {
        entries: [],
        folders: [],
        images: []
    };

    itemResults.forEach((item: ItemSearchResult) => {
        if (item.type === 'entry') {
            finalResult.entries.push(item);
        } else if (item.type === 'folder') {
            finalResult.folders.push(item);
        } else if (item.type === 'image') {
            finalResult.images.push(item);
        }
    });

    finalResult.entries.sort((a, b) => a.name.localeCompare(b.name));
    finalResult.folders.sort((a, b) => a.name.localeCompare(b.name));
    finalResult.images.sort((a, b) => a.name.localeCompare(b.name));

    return finalResult;
}

export const load: PageServerLoad = async ({ url, platform }) => {
    if (!platform) {
        throw new Error('no platform loaded');
    }

    const DB = platform.env.DB;

    const searchTerm = url.searchParams.get('query');
    const tags = url.searchParams.get('tags');
    const finalTags = tags ? tags.split(',') : [];

    const itemResults = await searchItems(
        DB,
        {
            searchTerm: searchTerm ? searchTerm : undefined,
            tags: finalTags
        }
    );
    
    const results = orderByType(itemResults);

    return {
        items: results
    };
}