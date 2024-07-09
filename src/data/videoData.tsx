export interface Video {
    id: number;
    title: string;
    embedUrl: string;
    category: string;
    tags: string[];
}

export const videoData: Video[] = [
    {
        id: 1,
        title: 'Video 1',
        embedUrl: 'https://www.youtube.com/embed/ImDkC1ozpP0',
        category: 'Category 1',
        tags: ['tag1', 'tag2']
    },
    {
        id: 2,
        title: 'Video 2',
        embedUrl: 'https://www.youtube.com/embed/OSMk1LcTIII',
        category: 'Category 1',
        tags: ['tag1', 'tag2']
    }
];