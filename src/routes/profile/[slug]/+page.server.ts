import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, platform, cookies }) => {
    const slug: string = params.slug;

    const images = [];
    for (let i = 0; i < 5; i++) {
        images.push({ name: 'Some piece', url: '/image/pay', preview: '/pay.png' });
    }
    for (let i = 0; i < 5; i++) {
        images.push({ name: 'Some other', url: '/image/urusaipay', preview: '/payalt.png' });
    }

    const characters = [];
    for (let i = 0; i < 10; i++) {
        characters.push({ name: 'Pay', url: '/character/pay', preview: '/pay.png' });
    }
    for (let i = 0; i < 5; i++) {
        characters.push({ name: 'Nadira', url: '/character/nadira', preview: '/nadira.jpeg' });
    }

    const folders = [];
    for (let i = 0; i < 2; i++) {
        folders.push({ name: 'LGBT Folder', url: '/someid'});
        folders.push({ name: 'Furry folder', url: '/someid'});
        folders.push({ name: 'Random stuff', url: '/someid'});
    }
    
    const response: FolderData = {
        username: slug,
        folders,
        images,
        characters
    }
    return response;
}