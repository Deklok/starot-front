interface EntrySectionRequest {
    title: string;
    content: string;
}

interface EntryAttributeRequest {
    label: string;
    value: string;
}

interface EntryImageRequest {
    filePath: string;
}

interface EntryRequest {
    itemId: number;
    name: string;
    image: string;
    attributes: EntryAttributeRequest[];
    images: EntryImageRequest[];
    sections: EntrySectionRequest[];
}