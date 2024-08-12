import Video from "@/types/Video";

export const getVideoByVideo_id = (id: string): Promise<Video> => {
  const getVideoByVideo_id = async function (): Promise<Video> {
    const response = await fetch("/api/videos/" + id);
    return await response.json();
  };
  return getVideoByVideo_id();
};

export const getVideosByTopicName = async (
  topicName: string
): Promise<Video[]> => {
  console.log("Fetching videos for topic: " + topicName);
  const response = await fetch(`/api/videos/?topic__name__iexact=${topicName}`);
  const data = await response.json();
  return data.results;
};

export const getVideosBySubtopicName = async (
  subtopic: string
): Promise<Video[]> => {
  const response = await fetch("/api/videos/?subtopic__name__iexact=" + subtopic);
  const data = await response.json();
  return data.results;
};

export const signature: string =
  "Rabbi Shimon Semp, Rosh Yeshiva Talpios inspires through bringing Jewish spiritual concepts, with Chassidic Torah teachings down to earth. Collecting anecdotes, sayings, and Divrei Torah from Chabad, Breslav, and other Hasidic masters and Rebbes. Listen and get inspired.";
