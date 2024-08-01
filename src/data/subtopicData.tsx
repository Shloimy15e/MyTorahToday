import { Url } from "next/dist/shared/lib/router/router";
import { topicData } from "./topicData";

export interface Subtopic {
    id: number;
    name: string;
    topic: "Parshah" | "Neviim" | "Chassidus" | "Lifes ways";
    image?: Url;
}

export const subtopicData: Subtopic[] = [
    {
        id: 1,
        name: "Berieshis",
        topic: "Parshah",
    },
    {
        id: 2,
        name: "Noach",
        topic: "Parshah"
    },
    {
        id: 3,
        name: "Lech lecha",
        topic: "Parshah"
    },
    {
        id: 4,
        name: "Vayeira",
        topic: "Parshah"
    },
    {
        id: 5,
        name: "Chayei Sarah",
        topic: "Parshah"
    },
    {
        id: 6,
        name: "Toldos",
        topic: "Neviim"
    },
    {
        id: 7,
        name: "Vayetzei",
        topic: "Parshah"
    },
    {
        id: 8,
        name: "Vayishlach",
        topic: "Parshah"
    },
    {
        id: 9,
        name: "Vayeshev",
        topic: "Parshah"
    },
    {
        id: 10,
        name: "Miketz",
        topic: "Parshah"
    },
    {
        id: 11,
        name: "Vayigash",
        topic: "Parshah"
    },
    {
        id: 12,
        name: "Vayechi",
        topic: "Parshah"
    },
    {
        id: 13,
        name: "Shemos",
        topic: "Parshah"
    },
    {
        id: 14,
        name: "Vaera",
        topic: "Parshah"
    },
    {
        id: 15,
        name: "Bo",
        topic: "Parshah"
    },
    {
        id: 16,
        name: "Beshalach",
        topic: "Parshah"
    },
    {
        id: 17,
        name: "Yisro",
        topic: "Parshah"
    },
    {
        id: 18,
        name: "Mishpatim",
        topic: "Parshah"
    },
    {
        id: 19,
        name: "Terumah",
        topic: "Parshah"
    },
    {
        id: 20,
        name: "Tetzaveh",
        topic: "Parshah"
    },
    {
        id: 21,
        name: "Ki Tisa",
        topic: "Parshah"
    },
    {
        id: 22,
        name: "Vayakhel",
        topic: "Parshah"
    },
    {
        id: 23,
        name: "Pikudei",
        topic: "Parshah"
    },
    {
        id: 26,
        name: "Vayikra",
        topic: "Parshah"
    },
    {
        id: 27,
        name: "Tzav",
        topic: "Parshah"
    },
    {
        id: 28,
        name: "Shmini",
        topic: "Parshah"
    },
    {
        id: 29,
        name: "Tazria",
        topic: "Parshah"
    },
    {
        id: 29,
        name: "Metzora",
        topic: "Parshah"
    },
    {
        id: 30,
        name: "Acharei Mot",
        topic: "Parshah"
    },
    {
        id: 31,
        name: "Kedoshim",
        topic: "Parshah"
    },
    {
        id: 32,
        name: "Emor",
        topic: "Parshah"
    },
    {
        id: 33,
        name: "Behar",
        topic: "Parshah"
    },
    {
        id: 34,
        name: "Bechukosai",
        topic: "Parshah"
    },
    {
        id: 35,
        name: "Bamidbar",
        topic: "Parshah"
    },
    {
        id: 36,
        name: "Naso",
        topic: "Parshah"
    },
    {
        id: 37,
        name: "Behaaloscha",
        topic: "Parshah"
    },
    {
        id: 38,
        name: "Sh'lach",
        topic: "Parshah"
    },
    {
        id: 39,
        name: "Korach",
        topic: "Parshah"
    },
    {
        id: 40,
        name: "Chukas",
        topic: "Parshah"
    },
    {
        id: 41,
        name: "Balak",
        topic: "Parshah"
    },
    {
        id: 42,
        name: "Pinchas",
        topic: "Parshah"
    },
    {
        id: 43,
        name: "Matos Masei",
        topic: "Parshah"
    },
    {
        id: 44,
        name: "Matos",
        topic: "Parshah"
    },
    {
        id: 45,
        name: "Masei",
        topic: "Parshah"
    },
    {
        id: 46,
        name: "Devarim",
        topic: "Parshah"
    },
    {
        id: 47,
        name: "Vaeschanan",
        topic: "Parshah"
    },
    {
        id: 48,
        name: "Eikev",
        topic: "Parshah"
    },
    {
        id: 49,
        name: "Re'eh",
        topic: "Parshah"
    },
    {
        id: 50,
        name: "Shoftim",
        topic: "Parshah"
    },
    {
        id: 51,
        name: "Ki Seitzei",
        topic: "Parshah"
    },
    {
        id: 52,
        name: "Ki Savo",
        topic: "Parshah"
    },
    {
        id: 53,
        name: "Nitzavim",
        topic: "Parshah"
    },
    {
        id: 54,
        name: "Vayeilech",
        topic: "Parshah"
    },
    {
        id: 55,
        name: "Ha'azinu",
        topic: "Parshah"
    },
    {
        id: 56,
        name: "Vezos Haberacha",
        topic: "Parshah"
    },
    {
        id: 24,
        name: "Shmuel A",
        topic: "Neviim"
    },
    {
        id: 25,
        name: "Shmuel B",
        topic: "Neviim"
    },
    {
        id: 57,
        name: "Melachim A",
        topic: "Neviim"
    },
    {
        id: 58,
        name: "Melachim B",
        topic: "Neviim"
    },
    {
        id: 61,
        name: "Yirmiyahu",
        topic: "Neviim"
    },
    {
        id: 62,
        name: "Yeshayahu",
        topic: "Neviim"
    },
    {
        id: 63,
        name: "Other",
        topic: "Chassidus"
    },
    {
        id: 64,
        name: "Other",
        topic: "Lifes ways"
    }
];
