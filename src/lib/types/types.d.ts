interface PreviewData {
    name: string;
    url: string;
    preview: string;
}

interface LinkItem {
    name: string;
    url: string;
}

interface FolderData  {
    folders: LinkItem[];
    images: PreviewData[];
    entries: PreviewData[];
}

interface CustomTag {
    //color: 'dark' | 'red' | 'yellow' | 'green' | 'indigo' | 'purple' | 'pink' | 'blue' | 'primary' | 'none';
    name: string;
    url: string;
}

interface ImageResponseData {
    name: string;
    imageUrl: string;
    tags: CustomTag[];
}

interface SimpleEntrySection {
    title: string;
    content: string;
}

interface EntryViewData {
    name: string;
    description: string;
    tags: CustomTag[];
    profileImage: string;
    images: ImageResponseData[];
    sections: SimpleEntrySection[];
}

interface SimpleItem {
    label: string;
    value: string;
}