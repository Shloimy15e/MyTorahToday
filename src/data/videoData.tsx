import Video from "@/types/Video";


export const getVideoByVideo_id = (id: string) : Promise<Video> => {
  const getVideoByVideo_id = async function (): Promise<Video> {
    const response = await fetch("/api/videos/" + id);
    return await response.json();
  }
  return getVideoByVideo_id();
};

export const getVideosByTopic = (videos: Video[], topicName: string): Video[] => {
  return videos.filter((video) => video.topic_name === topicName);
};

export const getVideosBySubtopic = (
  videos: Video[],
  subtopic: string
): Video[] => {
  return videos.filter((video) => video.subtopic_name === subtopic);
};

export const signature: string =
  "Rabbi Shimon Semp, Rosh Yeshiva Talpios inspires through bringing Jewish spiritual concepts, with Chassidic Torah teachings down to earth. Collecting anecdotes, sayings, and Divrei Torah from Chabad, Breslav, and other Hasidic masters and Rebbes. Listen and get inspired.";
