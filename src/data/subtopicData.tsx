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
        name: "Shmuel b",
        topic: "Neviim"
    },
    {
        id: 6,
        name: "Yeshayahu",
        topic: "Neviim"
    },
    {
        id: 7,
        name: "Pinchas",
        topic: "Parshah"
    },
    {
        id: 8,
        name: "Matos Masei,
        topic: "Parshah"
    },
    {
        id: 9,
        name: "Toldos",
        topic: "Parshah"
    },
    {
        id: 10,
        name: "Vayishlach",
        topic: "Parshah"
    }
];
