import { IMAGES_BASE_URL } from "$env/static/private";
import { tryCatch } from "$lib/utils/trycatch";
import type { R2Bucket } from "@cloudflare/workers-types"

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
        console.log('error on R2 upload');
        throw new Error(error.message);
    }

    return `${IMAGES_BASE_URL}/${filePath}`;
}