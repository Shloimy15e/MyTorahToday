"use client";
import Image from "next/image";
import VideoCard from "@/components/VideoCard";
import LoadingVideoCardAnimation from "./LoadingVideoCardAnimation";
import VideoDialog from "@/components/VideoDialog";
import { useState } from "react";
import Link from "next/link";
import Video from "@/types/Video";
import { useQuery } from "react-query";

type Props = {
  params: {
    topic: string;
    subtopic: string;
  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default function MainSubtopics({ params }: Props) {
  const { topic, subtopic } = params;
  const extractTopic = topic.replace("-%", " ");
  const extractSubtopic = subtopic.replace(/%20/g, " ").replace(/-/g, " ");  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video>({} as Video);

  const {
    isLoading: isLoading,
    error: videosError,
    data: videos,
  } = useQuery("videos", async () =>
    fetch(
      `/api/videos?limit=100&topic__name__iexact=${extractTopic}&subtopic__name__iexact=${extractSubtopic}`
    ).then((res) => res.json())
  );

  const openDialog = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo({} as Video);
  };

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
        <h1 className="absolute capitalize text-white text-3xl md:text-5xl lg:text-6xl font-bold">
          {extractSubtopic}
        </h1>
      </div>
      <div className="bg-neutral-100 grid grid-cols-1 justify-items-center py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
            {Array.from({ length: 10 }).map((_, index) => (
              <LoadingVideoCardAnimation key={index} />
            ))}
          </div>
        ) : videosError ? (
          <div className="flex flex-col items-center justify-center h-64">
            <h1 className="text-4xl font-bold mb-4">Error fetching videos</h1>
            <p className="text-gray-600 text-xl">
              Sorry, there was an error fetching the videos. Please try again
              later.
            </p>
          </div>
        ) : videos.results.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
              {videos.results.map((video: Video) => (
                <VideoCard
                  video={video}
                  key={video.id}
                  onClick={() => openDialog(video)}
                  showDescription={true}
                />
              ))}
            </div>
            <div className="flex justify-center items-center">
              <Link
                href={`/topics/${topic}`}
                className="text-lg capitalize bg-primary-blue text-gray-100 font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-blue-950"
              >
                Return to {extractTopic}
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center m-2 gap-2">
            <h1 className="text-2xl font-bold capitalize">
              No videos found in {extractSubtopic}
            </h1>
            <Link
              href={`/topics/${topic}`}
              className="text-lg capitalize bg-primary-blue text-gray-100 font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-blue-950"
            >
              Go back to {extractTopic}
            </Link>
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
