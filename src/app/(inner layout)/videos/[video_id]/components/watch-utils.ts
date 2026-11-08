import type Video from "@/types/Video";

export function uniqueRelatedVideos(videos: Video[], currentVideoId: number): Video[] {
  const seen = new Set([currentVideoId]);
  return videos.filter((video) => {
    if (seen.has(video.id)) return false;
    seen.add(video.id);
    return true;
  });
}

export function videoShareUrl(videoId: number, origin: string): string {
  return new URL(`/videos/${videoId}`, origin).href;
}
