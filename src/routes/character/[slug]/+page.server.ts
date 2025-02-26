export const load = async ({ params }) => {
    
    const response: EntryViewData = {
        name: 'Pay',
        tags: [],
        description: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
        profileImage: '/pay.png',
        images: [
            { name: 'Pay pay', imageUrl: '/pay.png', tags:[] },
            { name: 'Pay pay', imageUrl: '/payalt.png', tags:[] },
            { name: 'Pay pay', imageUrl: '/paypay.jpg', tags:[] },
            { name: 'Pay pay', imageUrl: '/maspay.png', tags:[] },
            { name: 'Pay pay', imageUrl: '/payfull.jpg', tags:[] },
            { name: 'Pay pay', imageUrl: '/payyobs.jpg', tags:[] }
        ],
        sections: [
            { title: 'Resumen', content: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.` }
        ]
    }

    return response;
}