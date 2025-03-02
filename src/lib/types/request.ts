interface EntrySectionRequest {
    title: string;
    content: string;
    displayOrder: number;
}

interface EntryAttributeRequest {
    label: string;
    value: string;
    displayOrder: number;
}

interface EntryImageRequest {
    filePath: string;
    displayOrder: number;
}

interface EntryRequest {
    itemId: number;
    name: string;
    image: string;
    attributes: EntryAttributeRequest[];
    images: EntryImageRequest[];
    sections: EntrySectionRequest[];
}