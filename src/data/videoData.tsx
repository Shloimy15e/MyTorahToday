import Video from "@/types/Video";

/*
export const getVideoByVideo_id = (id: string) => {
  return videoData.find((video) => video.video_id === id);
};*/

export const getVideosByTopic = (videos: Video[], topicName: string): Video[] => {
  return videos.filter((video) => video.topic === topicName);
};

export const getVideosBySubtopic = (
  videos: Video[],
  subtopic: string
): Video[] => {
  return videos.filter((video) => video.subtopic === subtopic);
};

export const signature: string =
  "Rabbi Shimon Semp, Rosh Yeshiva Talpios inspires through bringing Jewish spiritual concepts, with Chassidic Torah teachings down to earth. Collecting anecdotes, sayings, and Divrei Torah from Chabad, Breslav, and other Hasidic masters and Rebbes. Listen and get inspired.";
