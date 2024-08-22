"use client";
import Video from "@/types/Video";
import VideoCard from "@/components/VideoCard";
import VideoDialog from "@/components/VideoDialog";
import { useState } from "react";

export default function HorizontalVideoGrid(props: { videos: Video[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video>({} as Video);

  const openDialog = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo({} as Video);
  };

  return (
    <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-8">
        {props.videos.map((video) => ( // Adjust slice as needed
          <VideoCard  key={video.id} video={video} onClick={() => openDialog(video)} showDescription={true} />
        ))}
        <VideoDialog video={selectedVideo} isOpen={isDialogOpen} onClose={closeDialog} />
      </div>
  );
}
