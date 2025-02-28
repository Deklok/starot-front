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
}

interface Image {
    id: number;
    itemId: number;
    filePath: string;
}

interface Entry {
    id: number;
    itemId: number;
    name: string;
    uniqueName: string;
}

interface EntrySection {
    id: number;
    entryId: number;
    title: string;
    content: string;
    displayOrder: number;
}

interface EntryAttribute {
    id: number;
    entryId: number;
    label: string;
    value: string;
    displayOrder: number;
}

interface EntryImage {
    entryId: number;
    imageId: number;
    displayOrder: number;
}

interface Tag {
    id: number;
    name: string;
}

interface ItemTag {
    itemId: number;
    tagId: number;
}