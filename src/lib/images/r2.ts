import { IMAGES_BASE_URL } from "$env/static/private";
import { tryCatch } from "$lib/utils/trycatch";
import type { R2Bucket, R2ObjectBody } from "@cloudflare/workers-types"

export const uploadFile = async (
    r2: R2Bucket,
    key: string,
    file: File
): Promise<string> => {
    const imgExt = file.name.split('.')[1];
    const filePath = `${key}.${imgExt}`;
    
    const buffer = await file.arrayBuffer();
    
    const { error } = await tryCatch(r2.put(filePath, buffer));

    if (error) {

        throw new Error(error.message);
    }

    return `${IMAGES_BASE_URL}/${filePath}`;
}

export const renameEntryFiles = async (
    r2: R2Bucket,
    oldEntryRoute: string,
    newEntryRoute: string
): Promise<void> => {
    const objectsToRename: {
        oldKey: string;
        newKey: string;
        object: any;
    }[] = [];

    const result = await r2.list({
        prefix: oldEntryRoute
    });

    console.log('result list r2', result.objects);

    for (const object of result.objects) {
        const oldKey = object.key;
        const newKey = oldKey.replace(oldEntryRoute, newEntryRoute);
        
        objectsToRename.push({
            oldKey,
            newKey,
            object
        });
    }

    console.log('objectsToRename', objectsToRename);

    await Promise.all(objectsToRename.map(async ({ newKey, object }) => {
        const { error } = await tryCatch(r2.put(object.key, newKey));

        if (error) {
            throw new Error(error.message);
        }

        const { error: deleteError } = await tryCatch(r2.delete(object.key));

        if (deleteError) {
            throw new Error(deleteError.message);
        }
    }));
}