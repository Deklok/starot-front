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
    profileSections: SimpleItem[];
    tags: CustomTag[];
    profileImage: string;
    images: ImageResponseData[];
    sections: SimpleEntrySection[];
}

interface SimpleItem {
    label: string;
    value: string;
}