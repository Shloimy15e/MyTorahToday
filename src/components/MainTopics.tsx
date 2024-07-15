"use client";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  videoData,
  getVideosByTopic,
  getVideosBySubtopic,
} from "@/data/videoData";
import VideoCard from "@/components/VideoCard";
import VideoDialog from "@/components/VideoDialog";
import { subtopicData } from "@/data/subtopicData";
import { useState } from "react";
import Link from "next/link";

type Props = {
  params: {
    topic: string;
  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default function MainTopics({ params }: Props) {
  const { topic } = params;
  const Topic = topic.charAt(0).toUpperCase() + topic.slice(1);
  const displayTopic = Topic.replace("-", " ");
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

  const videosInTopic = getVideosByTopic(videoData, Topic);

  return (
    <>
      {/* hero section */}
      <div className="relative w-full bg-gray-950 flex justify-center items-center">
        <Image
          src="/images/banner.jpg"
          alt="banner"
          width={30000}
          height={1080}
          className={"object-cover opacity-60"}
        />
        <h1 className="absolute text-white text-3xl md:text-5xl lg:text-6xl font-bold">
          {displayTopic}
        </h1>
      </div>
      <div className="bg-neutral-100 grid grid-cols-1 justify-items-center">
        {videosInTopic.length > 0 ? (
          // Get all videos in topic divided in subtopics
          subtopicData.map((subtopic) =>
            getVideosBySubtopic(videosInTopic, subtopic.name)
              .length === 0 ? null : (
              <div key={subtopic.id}>
                <h1 className="text-4xl font-bold my-6 ml-6">
                  {subtopic.name}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6 justify-items-center place-items-center align-middle w-full auto-rows-max p-6">
                  {getVideosBySubtopic(
                    videosInTopic,
                    subtopic.name
                  ).slice(0, 10).map((video) => (
                    <VideoCard
                      video={video}
                      key={video.id}
                      onClick={() => openDialog(video)}
                    />
                  ))}
                </div>
                <div className="flex justify-center items-center">
                  <Link href={`/topics/${topic}/${subtopic.name}`} 
                    className="text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 my-6 w-4/5">
                    See all for { subtopic.name }
                  </Link>
                </div>
              </div>
            )
          )
        ) : (
          <div className="p-6 w-3/5 text-center">
            <h1 className="text-3xl font-semibold text-gray-800">
              No videos are in topic &quot;{displayTopic}&quot;{" "}
            </h1>
            <p className="text-2xl text-gray-600">
              I&apos;m sorry but I didn&apos;t get yet to this topic you can
              check in a different time to see where I&apos;m up to.
            </p>
          </div>
        )}
      </div>
      <VideoDialog
        video={selectedVideo}
        isOpen={isDialogOpen}
        onClose={closeDialog}
      />
    </>
  );
}
