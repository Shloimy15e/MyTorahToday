"use client";
import Image from "next/image";
import {
  videoData,
  getVideosBySubtopic,
} from "@/data/videoData";
import VideoCard from "@/components/VideoCard";
import VideoDialog from "@/components/VideoDialog";
import { useState } from "react";
import Link from "next/link";
import Video from "@/types/Video";

type Props = {
  params: {
    topic: string;
    subtopic: string;
  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default function MainSubtopics({ params }: Props) {
  const { topic, subtopic } = params;
  const Topic = topic.charAt(0).toUpperCase() + topic.slice(1);
  const Subtopic = subtopic.charAt(0).toUpperCase() + subtopic.slice(1);
  const displayTopic = Topic.replace("-", " ");
  const displaySubtopic = Subtopic.replace("-", " ");
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

  const videosInSubtopic = getVideosBySubtopic(videoData, Subtopic);

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
          {displaySubtopic}
        </h1>
      </div>
      <div className="bg-neutral-100 grid grid-cols-1 justify-items-center py-16">
        {videosInSubtopic.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
            {videosInSubtopic.map((video) => (
              <VideoCard
                video={video}
                key={video.id}
                onClick={() => openDialog(video)}
                showDescription={true}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-2xl font-bold">
              No videos found in {displaySubtopic}
            </h1>
            <Link href={`/topics/${topic}`}>
              <a className="text-blue-500 underline">
                Go back to {displayTopic}
              </a>
            </Link>
          </div>
        )}
        <div className="flex justify-center items-center">
          <Link href={`/topics/${topic}`} className="text-lg bg-primary-blue text-gray-100 font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-blue-950">Return to {displayTopic}</Link>
        </div>
      </div>
      <VideoDialog
        video={selectedVideo}
        isOpen={isDialogOpen}
        onClose={closeDialog}
      />
    </>
  );
}
