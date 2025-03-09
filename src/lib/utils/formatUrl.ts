export function formatStringForURL(input: string): string {
    return input
        .toLowerCase() // Convert to lowercase
        .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric characters (except spaces and hyphens)
        .trim() // Remove leading and trailing spaces
        .replace(/[\s]+/g, '-') // Replace spaces with hyphens
        .replace(/[-]+/g, '-'); // Replace multiple hyphens with a single hyphen
}