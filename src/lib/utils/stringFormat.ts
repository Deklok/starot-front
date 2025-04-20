// Function to capitalize first letter for display
export const capitalizeFirstLetter = (string: string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const replaceEntryUniqueNameInUrl = (url: string, uniqueName: string) => {
    const urlParts = url.split('/');
    const entryUniqueName = urlParts[urlParts.length - 2];
    const result = url.replace(entryUniqueName, uniqueName);
    return result;
}