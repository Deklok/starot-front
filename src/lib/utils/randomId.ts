/**
 * Generates a random ID suitable for file names without dependencies
 * @param length Length of the ID (default: 16)
 * @returns A random string ID
 */
export function generateRandomId(length = 16): string {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}