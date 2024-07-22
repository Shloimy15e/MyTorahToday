"use client";
import { useState } from "react";
import VideoCard from "./VideoCard";
import VideoDialog from "./VideoDialog";
import {
  getVideosByTopic,
  videoData,
  getVideosBySubtopic,
} from "@/data/videoData";
import Image from "next/image";
import Link from "next/link";
import { topicData } from "@/data/topicData";
import { ChevronRightIcon } from "@heroicons/react/16/solid";

export const parshahThisWeek: string = "Balak";

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
              <h1 className=" leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
                {topic.name}
              </h1>
              {topic.name === "Parshah" && (
                <>
                  <h2 className="flex relative items-center text-3xl font-semibold mt-2 ml-16 pr-1 text-gray-700 w-max before:content-[''] before:absolute before:left-0 before:bottom-1.5 before:h-2 before:w-full before:bg-gray-900 before:opacity-35">
                    {parshahThisWeek}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                    {getVideosBySubtopic(videoData, parshahThisWeek)
                      .slice(0, 10)
                      .map((video) => (
                        <VideoCard
                          video={video}
                          key={video.id}
                          onClick={() => openDialog(video)}
                        />
                      ))}
                  </div>
                  <div className="flex justify-center items-center">
                    <Link
                      href={`/topics/parshah/${parshahThisWeek}`}
                      className="text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 my-6 w-4/5"
                    >
                      See all for {parshahThisWeek}
                    </Link>
                  </div>
                  <h2 className="flex relative items-center text-3xl font-semibold mt-2 ml-16 pr-1 text-gray-700 w-max before:content-[''] before:absolute before:left-0 before:bottom-1.5 before:h-2 before:w-full before:bg-gray-900 before:opacity-35">
                    Other {topic.name}s
                  </h2>
                </>
              )}{" "}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                {getVideosByTopic(videoData, topic.name)
                  .slice(0, 11)
                  .map((video) => (
                    <VideoCard
                      video={video}
                      key={video.id}
                      onClick={() => openDialog(video)}
                    />
                  ))}
              </div>
              <div className="flex justify-center items-center">
                <Link
                  href={`/topics/${topic.name}`}
                  className="text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-24 my-6 w-4/5"
                >
                  See all for {topic.name}
                </Link>
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
