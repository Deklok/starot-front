import { tryCatch } from "$lib/utils/trycatch";
import type { R2Bucket } from "@cloudflare/workers-types"

export const uploadFile = async (
    r2: R2Bucket,
    key: string,
    file: File
) => {
    const buffer = await file.arrayBuffer();
    
    const { error } = await tryCatch(r2.put(key, buffer));

    if (error) {
        console.log('error on R2 upload');
        throw new Error(error.message);
    }
}