export const getVideosByCategory = (videos: Video[], categoryName: string): Video[] => {
  return videos.filter(video => video.category === categoryName);
};

  

export interface Video {
  id: number;
  title: string;
  embedUrl: string;
  category: string;
  tags: string[];
  parsha?: string;
}

export const videoData: Video[] = [
  {
    id: 1,
    title: "Shelach: When it's time to make Lechaim 🍻",
    embedUrl: "https://www.youtube.com/embed/ImDkC1ozpP0",
    category: "Parshah",
    tags: [],
    parsha: "Shelach",
  },
  {
    id: 2,
    title: "Shelach: Who's the Boss",
    embedUrl: "https://www.youtube.com/embed/OSMk1LcTIII",
    category: "Parshah",
    tags: [],
    parsha: "Shelach",
  },
  {
    id: 3,
    title:
      "Chukas: Remember where you come from - but make sure the next generation connects to it too",
    embedUrl: "https://youtube.com/embed/qYYhOCJgkRk",
    category: "Parshah",
    tags: [],
    parsha: "Chukas",
  },
  {
    id: 4,
    title: "[#1088] Chukas: Make the cheshbon how you conquered Cheshbon",
    embedUrl: "https://www.youtube.com/embed/-Cu5HHzmT-A",
    category: "Parshah",
    tags: [],
    parsha: "Chukas",
  },
  {
    id: 5,
    title: "[#839] Chukas: Whenever you fall for whatever reason",
    embedUrl: "https://www.youtube.com/embed/AQLc4zVIMYw",
    category: "Parshah",
    tags: [],
    parsha: "Chukas",
  },
  {
    id: 6,
    title: "[#1089] Chukas: When you have red hot energy",
    embedUrl: "https://www.youtube.com/embed/a3UREmwcgJg",
    category: "Parshah",
    tags: [],
    parsha: "Chukas",
  },
  {
    id: 7,
    title: "[#837] Chukas: When stuffy noses are healthy",
    embedUrl: "https://www.youtube.com/embed/cVtnWLcZ3c0",
    category: "Parshah",
    tags: [],
    parsha: "Chukas",
  },
  {
    id: 8,
    title: "[#840] Chukas: How Red Cows fix up Oiber-chachamim",
    embedUrl: "https://www.youtube.com/embed/sNEam3ENgJw",
    category: "Parshah",
    tags: [],
    parsha: "Chukas",
  },
  {
    id: 9,
    title: "[1203] Shmuel 1: How being stuck creates prayer",
    embedUrl: "https://www.youtube.com/embed/9JguNiqUP5g",
    category: "Neviim",
    tags: [],
  },
  {
    id: 10,
    title: "[1204] Shmuel 2: Channah's observations about life",
    embedUrl: "https://www.youtube.com/embed/KksHtHI-B9A",
    category: "Neviim",
    tags: [],
  },
  {
    id: 11,
    title: "[1205] Shmuel 3: The story of the 3 cows",
    embedUrl: "https://www.youtube.com/embed/iBTqo-zOoME",
    category: "Neviim",
    tags: [],
  }
];
