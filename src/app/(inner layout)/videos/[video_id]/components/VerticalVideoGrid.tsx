"use client";

import Video from "@/types/Video";
import VideoCard from "@/components/VideoCard";

export default function VerticalVideoGrid({ videos }: { videos: Video[] }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">{videos.map((video) => <VideoCard key={video.id} video={video} showDescription={false} />)}</div>;
}
