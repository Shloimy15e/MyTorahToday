import Video from "@/types/Video";

export const getVideoByVideo_id = (id: string): Promise<Video> => {
  const getVideoByVideo_id = async function (): Promise<Video> {
    const response = await fetch("https://www.mytorahtoday.com/api/videos/" + id);
    return await response.json();
  };
  return getVideoByVideo_id();
};

export const getVideosByTopicName = async (
  topic: string,
  limit: number = 6
): Promise<{ topicName: string; videos: Video[] }> => {
  const response = await fetch(
    `https://www.mytorahtoday.com/api/videos/?limit=${limit}&topic__name__iexact=${topic}`
  );
  const data = await response.json();
  return { topicName: topic, videos: data.results };
};

export const getVideosBySubtopicName = async (
  subtopic: string,
  limit: number = 10
): Promise<Video[]> => {
  const url = `https://www.mytorahtoday.com/api/videos/?limit=${limit}&subtopic__name__iexact=${subtopic}`
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
};

export const fetchTopics = async (): Promise<any> => {
  const response = await fetch("https://www.mytorahtoday.com/api/topics/");
  const data = await response.json();
  return data.results;
};

export const signature: string =
  "Rabbi Shimon Semp, Rosh Yeshiva Talpios inspires through bringing Jewish spiritual concepts, with Chassidic Torah teachings down to earth. Collecting anecdotes, sayings, and Divrei Torah from Chabad, Breslav, and other Hasidic masters and Rebbes. Listen and get inspired.";
