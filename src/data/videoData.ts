export const getVideosByTopic = (
  videos: Video[],
  topicName: string
): Video[] => {
  return videos.filter((video) => video.topic === topicName);
};

export const getVideosBySubtopic = (
  videos: Video[],
  subtopic: string
): Video[] => {
  return videos.filter((video) => video.subtopic === subtopic);
};

export interface Video {
  id: number;
  title: string;
  embedUrl: string;
  topic: string;
  tags: string[];
  subtopic?: string;
}

export const videoData: Video[] = [
  {
    id: 1,
    title: "Shelach: When it's time to make Lechaim 🍻",
    embedUrl: "https://www.youtube.com/embed/ImDkC1ozpP0",
    topic: "Parshah",
    tags: [],
    subtopic: "Shelach",
  },
  {
    id: 2,
    title: "Shelach: Who's the Boss",
    embedUrl: "https://www.youtube.com/embed/OSMk1LcTIII",
    topic: "Parshah",
    tags: [],
    subtopic: "Shelach",
  },
  {
    id: 3,
    title:
      "Chukas: Remember where you come from - but make sure the next generation connects to it too",
    embedUrl: "https://youtube.com/embed/qYYhOCJgkRk",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
  },
  {
    id: 4,
    title: "[#1088] Chukas: Make the cheshbon how you conquered Cheshbon",
    embedUrl: "https://www.youtube.com/embed/-Cu5HHzmT-A",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
  },
  {
    id: 5,
    title: "[#839] Chukas: Whenever you fall for whatever reason",
    embedUrl: "https://www.youtube.com/embed/AQLc4zVIMYw",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
  },
  {
    id: 6,
    title: "[#1089] Chukas: When you have red hot energy",
    embedUrl: "https://www.youtube.com/embed/a3UREmwcgJg",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
  },
  {
    id: 7,
    title: "[#837] Chukas: When stuffy noses are healthy",
    embedUrl: "https://www.youtube.com/embed/cVtnWLcZ3c0",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
  },
  {
    id: 8,
    title: "[#840] Chukas: How Red Cows fix up Oiber-chachamim",
    embedUrl: "https://www.youtube.com/embed/sNEam3ENgJw",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
  },
  {
    id: 9,
    title: "[1203] Shmuel 1: How being stuck creates prayer",
    embedUrl: "https://www.youtube.com/embed/9JguNiqUP5g",
    topic: "Neviim",
    tags: [],
    subtopic: "Shmuel",
  },
  {
    id: 10,
    title: "[1204] Shmuel 2: Channah's observations about life",
    embedUrl: "https://www.youtube.com/embed/KksHtHI-B9A",
    topic: "Neviim",
    tags: [],
    subtopic: "Shmuel",
  },
  {
    id: 11,
    title: "[1205] Shmuel 3: The story of the 3 cows",
    embedUrl: "https://www.youtube.com/embed/iBTqo-zOoME",
    topic: "Neviim",
    tags: [],
    subtopic: "Shmuel",
  },
  {
    id: 12,
    embedUrl: "https://www.youtube.com/embed/YwqyAFop74M",
    title: 'Balak: A sin called "I didn&#39;t know"',
    topic: "Parshah",
    tags: ['sin', 'peshische', 'present', 'tune-in'],
    subtopic: "Balak",
  },
  {
    id: 13,
    embedUrl: "https://www.youtube.com/embed/i80aN_B-6r0",
    title: "Balak: ב-אהבת ל-רעך ק- מוך",
    topic: "Parshah",
    tags: ['love', 'ahavas yisroel', 'oihev yisroel'],
    subtopic: "Balak",
  },
  {
    id: 14,
    embedUrl: "https://www.youtube.com/embed/Gn5vAyv3cuk",
    title: "Balak: Why curse when you can choose to be blessed instead?!?",
    topic: "Parshah",
    tags: ['blessing', 'life of blessing'],
    subtopic: "Balak",
  },
  {
    id: 15,
    embedUrl: "https://www.youtube.com/embed/IlIymt0ZZ6E",
    title: "[1291] Yeshayahu 2 Visions of world peace in today world",
    topic: "Neviim",
    tags: ['world peace', 'beis hamikdash', 'mashiach'],
    subtopic: "Yeshayahu",
  },
  {
    id: 16,
    embedUrl: "https://www.youtube.com/embed/xBgKAbR85qk",
    title: "[1290] Yeshayahu 1 \"I don't care about your frumkeit. What are you doing for the disadvantaged?!\"",
    topic: "Neviim",
    tags: ['world peace', 'beis hamikdash', 'oihev yisroel'],
    subtopic: "Yeshayahu",
  },
  {
    id: 17,
    embedUrl: "https://www.youtube.com/embed/Tr2NPYvQ6A4",
    title: "[#844] Balak: What makes a Mistake into a Sin?",
    topic: "Parshah",
    tags: ['sin', 'mistake', 'connect'],
    subtopic: "Balak",
  },
  {
    id: 18,
    embedUrl: "https://www.youtube.com/embed/RiWzeV1_pqU",
    title: "Balak: So what's the secret, how do you make donkeys talk?",
    topic: "Parshah",
    tags: ['stuck', 'phonecall', 'talk to God'],
    subtopic: "Balak",
  }
];
