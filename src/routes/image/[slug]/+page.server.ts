export const load = async ({ params }) => {
    const response: ImageResponseData = {
        name: 'My coso favorito de pay la amo joder',
        imageUrl: '/pay.png',
        tags: [
            { color: 'red', name: 'Faroven', url:'/search/Faroven' },
            { color: 'blue', name: 'Nachi', url:'/search/Faroven' },
            { color: 'indigo', name: 'Chessecake', url:'/search/Faroven' },
        ]
    }

    return response;
}