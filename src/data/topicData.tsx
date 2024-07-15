export interface Topic {
    id: number;
    name: string;
    //image: string;
}

export const topicData: Topic[] = [
    {
        id: 1,
        name: "Parshah",
    },
    {
        id: 2,
        name: "Neviim",
    },
    {
        id: 3,
        name: "Chassidus",
    },
    {
        id: 4,
        name: "Lifes ways",
    },
];

export const topicNames = topicData.map(topic => topic.name);