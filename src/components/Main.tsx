"use client";
import { useState } from "react";
import VideoCard from "./VideoCard";
import VideoDialog from "./VideoDialog";
import { getVideosByTopic, videoData } from "@/data/videoData";
import Image from "next/image";
import { topicData } from "@/data/topicData";

export default function Main() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const openDialog = (video: any) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo(null);
  };

  return (
    <>
      <main className="bg-neutral-100 grid grid-cols-1">
        {/* Hero section */}
        <div>
          <Image
            src="/images/banner.jpg"
            alt="banner"
            width={30000}
            height={1080}
            className=" object-cover"
          />{" "}
        </div>
        {/* list of all videos devided by topic */}
        {topicData.map((topic) =>
          getVideosByTopic(videoData, topic.name).length === 0 ? null : (
            <div key={topic.id}>
              <h1 className="text-4xl font-bold my-6 ml-6">{topic.name}</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6 justify-items-center place-items-center align-middle w-full auto-rows-max p-6">
                {getVideosByTopic(videoData, topic.name).map((video) => (
                  <VideoCard
                    video={video}
                    key={video.id}
                    onClick={() => openDialog(video)}
                  />
                ))}
              </div>
            </div>
          )
        )}
        <VideoDialog
          isOpen={isDialogOpen}
          video={selectedVideo}
          onClose={closeDialog}
        />
      </main>
    </>
  );
}
