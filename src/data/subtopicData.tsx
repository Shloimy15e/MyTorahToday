import { Url } from "next/dist/shared/lib/router/router";

export interface Subtopic {
    id: number;
    name: string;
    topic: string;
    image?: Url;
}

export const subtopicData: Subtopic[] = [
    {
        id: 1,
        name: "Shelach",
        topic: "Parshah",
    },
    {
        id: 2,
        name: "Korach",
        topic: "Parshah"
    },
    {
        id: 3,
        name: "Chukas",
        topic: "Parshah"
    },
    {
        id: 4,
        name: "Balak",
        image: "/images/topics/balak.jpg",
        topic: "Parshah"
    },
    {
        id: 5,
        name: "Shmuel",
        topic: "Neviim"
    },
    {
        id: 6,
        name: "Yeshayahu",
        topic: "Neviim"
    }
];