"use client";
import { useState } from "react";
import VideoCard from "./VideoCard";
import VideoDialog from "./VideoDialog";
import { getVideosByCategory, videoData } from "@/data/videoData";
import Image from "next/image";
import { categoryData } from "@/data/categoryData";

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
          />{" "}
        </div>
        <h1 className="text-4xl font-bold my-6 ml-6">Parshas Shelach</h1>
        {/* list of all videos devided by category */}
        {categoryData.map((category) =>
          getVideosByCategory(videoData, category.name).length === 0 ? null : (
            <div key={category.id}>
              <h1 className="text-2xl font-bold my-6 ml-6">{category.name}</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6 justify-items-center place-items-center align-middle w-full auto-rows-max p-6">
                {getVideosByCategory(videoData, category.name).map((video) => (
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
          onClose={close}
        />
      </main>
    </>
  );
}
