interface User {
    id: number;
    username: string;
    uniqueName: string;
    createdAt: string;
}

interface Session {
    id: string;
    userId: number;
}

interface World {
    id: number;
    name: string;
    uniqueName: string;
    userId: number;
    createdAt: string;
}

interface Item {
    id: number;
    type: 'image' | 'entry' | 'folder';
    parentId: number | null;
    worldId: number;
    name: string;
    uniqueName: string;
    createdAt: string;
}

interface ItemWithPreview extends Item {
    preview: string | null
    entryPreview: string | null
}

interface Image {
    id: number;
    itemId: number;
    filePath: string;
}

interface EntrySection {
    id: number;
    title: string;
    content: string;
    displayOrder: number;
}

interface EntryAttribute {
    id: number;
    label: string;
    value: string;
    displayOrder: number;
}

interface EntryImage {
    filePath: string;
    displayOrder: number;
}

interface Entry {
    id: number;
    itemId: number;
    name: string;
    imageUrl: string;
    attributes: EntryAttribute[];
    images: EntryImage[];
    sections: EntrySection[];

}

interface Tag {
    id: number;
    name: string;
}

interface ItemTag {
    itemId: number;
    tagId: number;
}