"use client";

import Video from "@/types/Video";
import VideoCard from "@/components/VideoCard";

export default function HorizontalVideoGrid({ videos }: { videos: Video[] }) {
  return <div className="grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{videos.map((video) => <VideoCard key={video.id} video={video} showDescription={false} />)}</div>;
}
