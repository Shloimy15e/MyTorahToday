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
  description: string;
}

export const signature: string = "Rabbi Shimon Semp, Rosh Yeshiva Talpios inspires through bringing Jewish spiritual concepts, with Chassidic Torah teachings down to earth. Collecting anecdotes, sayings, and Divrei Torah from Chabad, Breslav, and other Hasidic masters and Rebbes. Listen and get inspired.";

export const videoData: Video[] = [
  {
    id: 1,
    title: "Shelach: When it's time to make Lechaim 🍻",
    embedUrl: "https://www.youtube.com/embed/ImDkC1ozpP0",
    topic: "Parshah",
    tags: [],
    subtopic: "Shelach",
    description: signature
  },
  {
    id: 2,
    title: "Shelach: Who's the Boss",
    embedUrl: "https://www.youtube.com/embed/OSMk1LcTIII",
    topic: "Parshah",
    tags: [],
    subtopic: "Shelach",
    description: signature
  },
  {
    id: 3,
    title:
      "Chukas: Remember where you come from - but make sure the next generation connects to it too",
    embedUrl: "https://youtube.com/embed/qYYhOCJgkRk",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
    description: signature
  },
  {
    id: 4,
    title: "[#1088] Chukas: Make the cheshbon how you conquered Cheshbon",
    embedUrl: "https://www.youtube.com/embed/-Cu5HHzmT-A",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
    description: signature
  },
  {
    id: 5,
    title: "[#839] Chukas: Whenever you fall for whatever reason",
    embedUrl: "https://www.youtube.com/embed/AQLc4zVIMYw",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
    description: signature
  },
  {
    id: 6,
    title: "[#1089] Chukas: When you have red hot energy",
    embedUrl: "https://www.youtube.com/embed/a3UREmwcgJg",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
    description: signature
  },
  {
    id: 7,
    title: "[#837] Chukas: When stuffy noses are healthy",
    embedUrl: "https://www.youtube.com/embed/cVtnWLcZ3c0",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
    description: signature
  },
  {
    id: 8,
    title: "[#840] Chukas: How Red Cows fix up Oiber-chachamim",
    embedUrl: "https://www.youtube.com/embed/sNEam3ENgJw",
    topic: "Parshah",
    tags: [],
    subtopic: "Chukas",
    description: signature
  },
  {
    id: 9,
    title: "[1203] Shmuel 1: How being stuck creates prayer",
    embedUrl: "https://www.youtube.com/embed/9JguNiqUP5g",
    topic: "Neviim",
    tags: [],
    subtopic: "Shmuel",
    description: signature
  },
  {
    id: 10,
    title: "[1204] Shmuel 2: Channah's observations about life",
    embedUrl: "https://www.youtube.com/embed/KksHtHI-B9A",
    topic: "Neviim",
    tags: [],
    subtopic: "Shmuel",
    description: signature
  },
  {
    id: 11,
    title: "[1205] Shmuel 3: The story of the 3 cows",
    embedUrl: "https://www.youtube.com/embed/iBTqo-zOoME",
    topic: "Neviim",
    tags: [],
    subtopic: "Shmuel",
    description: signature
  },
  {
    id: 12,
    embedUrl: "https://www.youtube.com/embed/YwqyAFop74M",
    title: 'Balak: A sin called "I didn\'t know"',
    topic: "Parshah",
    tags: ["sin", "peshische", "present", "tune-in"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 13,
    embedUrl: "https://www.youtube.com/embed/i80aN_B-6r0",
    title: "Balak: ב-אהבת ל-רעך ק- מוך",
    topic: "Parshah",
    tags: ["love", "ahavas yisroel", "oihev yisroel"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 14,
    embedUrl: "https://www.youtube.com/embed/Gn5vAyv3cuk",
    title: "Balak: Why curse when you can choose to be blessed instead?!?",
    topic: "Parshah",
    tags: ["blessing", "life of blessing"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 15,
    embedUrl: "https://www.youtube.com/embed/IlIymt0ZZ6E",
    title: "[1291] Yeshayahu 2 Visions of world peace in today world",
    topic: "Neviim",
    tags: ["world peace", "beis hamikdash", "mashiach"],
    subtopic: "Yeshayahu",
    description: signature
  },
  {
    id: 16,
    embedUrl: "https://www.youtube.com/embed/xBgKAbR85qk",
    title:
      '[1290] Yeshayahu 1 "I don\'t care about your frumkeit. What are you doing for the disadvantaged?!"',
    topic: "Neviim",
    tags: ["world peace", "beis hamikdash", "oihev yisroel"],
    subtopic: "Yeshayahu",
    description: signature
  },
  {
    id: 17,
    embedUrl: "https://www.youtube.com/embed/Tr2NPYvQ6A4",
    title: "[#844] Balak: What makes a Mistake into a Sin?",
    topic: "Parshah",
    tags: ["sin", "mistake", "connect"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 18,
    embedUrl: "https://www.youtube.com/embed/RiWzeV1_pqU",
    title: "Balak: So what's the secret, how do you make donkeys talk?",
    topic: "Parshah",
    tags: ["stuck", "phonecall", "talk to God"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 19,
    embedUrl: "https://www.youtube.com/embed/gZLYtEzVmZw",
    title: "[#847] Balak: Conquering the Land of Words",
    topic: "Parshah",
    tags: ["words", "power of a word"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 20,
    embedUrl: "https://www.youtube.com/embed/VRNR-60aiow",
    title: "[#848] Balak: The sin of being too busy to notice",
    topic: "Parshah",
    tags: ["sin", "midfull"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 21,
    embedUrl: "https://www.youtube.com/embed/g60QQtMWBjI",
    title: "BALAK: HOW TO SPELL V'AHAVTA L'REACHA KAMOCHA",
    topic: "Parshah",
    tags: ["love", "ahavas yisroel"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 22,
    embedUrl: "https://www.youtube.com/embed/XiilAYVfoRg",
    title: "When that donkey rams you against the wall",
    topic: "Parshah",
    tags: ["stuck", "communicate", "listen"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 23,
    embedUrl: "https://www.youtube.com/embed/kX5YzgQAuRs",
    title: "[#848] Balak: The system of stink",
    topic: "Parshah",
    tags: ["system"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 24,
    embedUrl: "https://www.youtube.com/embed/tTpYcONzMmg",
    title: "BALAK: SEE NO EVIL",
    topic: "Parshah",
    tags: ["ahavas yisroel"],
    subtopic: "Balak",
    description:
      "Lo Hibit Uven B'Yakov - he saw no sin in others, said the holy Rizhener about the Bardichever who was the closest Jew in the world, that whenever a person realizes that he only has to see the goodness in others, and all he has to do is find the “נקודה טובה” in every single Jew then השם אלוקיו עמו - that’s when Hashem joins with him. Let’s realize that we have that ability to see ourselves and others in a positive light… Today. " + signature,
  },
  {
    id: 25,
    embedUrl: "https://www.youtube.com/embed/RKqEnGGWQBQ",
    title: "Balak: The bright side of antisemitism",
    topic: "Parshah",
    tags: ["antisemitism", "light", "besht", "mikveh"],
    subtopic: "Balak",
    description: `The holy Baal Shem Tov was walking down the path away from the Mikveh where he just immersed himself, and a bunch of hooligans were coming against him. And he didn't want them to touch him so that he shouldn't have to immerse himself again, and then he heard them say "let's stay away from that dirty Jew" - and they moved aside.
                  Said the holy Baal Shem Tov: הֶן עָם לְבָדָד יִשְׁכֹּן – Sometimes in order for this עם to remain בודד - isolated so that they can experience their purity and their connection to Hashem – וּבַגּוֹיִם לֹא יִתְחַשָּׁב – we need גויים to say "I'm not מחשב you, dirty Jew".
                  There's a bright side to anti-Semitism; they let us be, so that we could be that which we are – Hashem's nation… Today. ` + signature
  },
  {
    id: 26,
    embedUrl: "https://www.youtube.com/embed/GLDxr4jjxXw",
    title: "BALAK: BILAAM\'S WORDS IN KRIAS SHEMA...?",
    topic: "Parshah",
    tags: ["curse", "blessing", "shema"],
    subtopic: "Balak",
    description: `So the Gemara says an amazing statement, they wanted to take everything Bilaam ever said and put it into Birchas Krias Shema. 
                  And the Sfas Emes wonders why in the world would you want to take what Bilaam said and put it into Krias Shema? The secret is - says the Sfas Emes - no matter what happens, even if somebody wants to curse you, even if there’s obstacles in your life, even if you meet your “Bilaam” know that at the end of the day it’s all from Hashem, and anything that happens is only here in order to connect you to Hashem. 
                  And when you realize that, you know what happens to all those curses in your life? Wow, it turns into the greatest blessing ever found… Today. ` + signature,
  },
  {
    id: 27,
    embedUrl: "https://www.youtube.com/embed/l4UCRYdZn8c",
    title: "Balak: What to do when your coals are smoldering",
    topic: "Parshah",
    tags: ["fire", "hisbodedus"],
    subtopic: "Balak",
    description: `הן עם... 
                  When their fire is dimmed 
                  לבדד ישכן... 
                  They go make hisbodedus
                  🔥` + signature
  },
  {
    id: 28,
    embedUrl: "https://www.youtube.com/embed/bOAA77o7SPI",
    title: "[#843] Balak: When nothing shocks you any longer",
    topic: "Parshah",
    tags: ["talking donkey", "listen"],
    subtopic: "Balak",
    description: `It's not every day that a donkey starts speaking. And when they do, you'd expect a shock; but instead Bilaam said  כִּי הִתְעַלַּלְתְּ בִּי – "You were mocking me." 
                  And Rabbeinu Bechayai wonders: Why didn't he just stop and say "Hey, what's going on here?" And the answer is that when you want something, your mind works overtime and it carries you away and doesn't allow you to notice what's going on.
                  The message of Bilaam is one thing: Everything that's going on around you is amazing, it's communications from above. But you have to shut up and listen… Today. 
                  ` + signature,
  },
  {
    id: 29,
    embedUrl: "https://www.youtube.com/embed/tK2s4qIQ1Qg",
    title: "[#1092] Balak: What? Brisker Rav was lenient?!",
    topic: "Parshah",
    tags: ["living judaism", "brisker rav", "chinuch"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 30,
    embedUrl: "https://www.youtube.com/embed/E4OgiZcVkfY",
    title: "[#1093] Balak: Is \"I didn\'t know\" a good excuse?",
    topic: "Parshah",
    tags: [],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 31,
    embedUrl: "https://www.youtube.com/embed/mCLjiUIdynI",
    title: '[#1094] Balak: "If I\'m ready to believe... Bring me to Kozhnitzer Magid first!"',
    topic: "Parshah",
    tags: ["living judaism", "brisker rav", "chinuch"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 32,
    embedUrl: "https://www.youtube.com/embed/s2unLKXzz4E",
    title: "[1196] Balak: What would you do if your dishwasher began talking??",
    topic: "Parshah",
    tags: ["shiur", "recent", "theory"],
    subtopic: "Balak",
    description: signature
  },
  {
    id: 33,
    embedUrl: "https://www.youtube.com/embed/yWEQDhD8bcA",
    title: "[#1095] Balak: Good advice from Bilaam - Aint nothing smarter than admitting you messed up",
    topic: "Parshah",
    tags: [],
    subtopic: "Balak",
    description: signature
  }
];
