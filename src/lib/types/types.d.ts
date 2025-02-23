interface PreviewData {
    name: string;
    url: string;
    preview: string;
}

interface LinkItem {
    name: string;
    url: string;
}

interface ProfileData  {
    username: string;
    folders: LinkItem[];
    images: PreviewData[];
    characters: PreviewData[];
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

interface CharacterSection {
    title: string;
    content: string;
}

interface CharacterProfileData {
    name: string;
    description: string;
    tags: CustomTag[];
    profileImage: string;
    images: ImageResponseData[];
    sections: CharacterSection[];
}

interface SimpleItem {
    label: string;
    value: string;
}