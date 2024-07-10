export interface Category {
    id: number;
    name: string;
    //image: string;
}

export const categoryData: Category[] = [
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

export const categoryNames = categoryData.map(category => category.name);