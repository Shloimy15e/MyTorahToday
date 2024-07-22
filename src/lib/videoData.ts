import { cache } from "react";

export interface Video {
  publishedAt: any;
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  topic: string;
  tags: string[];
  views: number;
  likes: number;
  createdAt: string;
  duration: string;
}

export const fetchVideoData = cache(async (): Promise<Video[]> => {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const apiKey = process.env.YOUTUBE_API_KEY;

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=50`
    );
    const data = await response.json();

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      likes: item.statistics.likeCount,
      views: item.statistics.viewCount,
      duration: item.contentDetails.duration,
    }));
  } catch (error) {
    console.error("Error fetching video data:", error);
    return [];
  }
});

export async function searchVideos(query: string): Promise<Video[]> {
  const videos = await fetchVideoData();
  return videos.filter(
    (video) =>
      video.title.toLowerCase().includes(query.toLowerCase()) ||
      video.description.toLowerCase().includes(query.toLowerCase())
  );
}
