"use client";
import Image from "next/image";
import { getVideosBySubtopic } from "@/data/videoData";
import VideoCard from "@/components/VideoCard";
import VideoDialog from "@/components/VideoDialog";
import { subtopicData } from "@/data/subtopicData";
import { useState, useEffect } from "react";
import Link from "next/link";
import Video from "@/types/Video";
import LoadingAnimation from "@/components/LoadingAnimation";

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
  const [selectedVideo, setSelectedVideo] = useState<Video>({} as Video);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const openDialog = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo({} as Video);
  };

  useEffect(() => {
    const apiVideos = async () => {
      console.log("Starting video fetch process");
      try {
        const response = await fetch("/api/videos?limit=100&topic=" + topic);
        console.log(`Received response with status: ${response.status}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }
        console.log(
          "Successfully fetched videos. Total videos:",
          data.results.length
        );
        // Extract videosfrom results
        setVideos(data.results);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching videos:", error);
        return error;
      } finally {
        console.log("Video fetch process completed");
      }
    };
    apiVideos();
  }, [topic]);

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
        {isLoading ? (
          <LoadingAnimation />
        ) : videos.length > 0 ? (
          // Get all videos in topic divided in subtopics
          subtopicData.map((subtopic) =>
            getVideosBySubtopic(videos, subtopic.name).length === 0 ? (
              <div key={subtopic.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                  {videos.map((video) => (
                      <VideoCard
                        video={video}
                        key={video.id}
                        onClick={() => openDialog(video)}
                        showDescription={true}
                      />
                    ))}
                </div>
            ) : (
              <div key={subtopic.id}>
                <h1 className="text-4xl font-bold my-6 ml-6">
                  {subtopic.name}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                  {getVideosBySubtopic(videos, subtopic.name)
                    .slice(0, 10)
                    .map((video) => (
                      <VideoCard
                        video={video}
                        key={video.id}
                        onClick={() => openDialog(video)}
                        showDescription={true}
                      />
                    ))}
                </div>
                {getVideosBySubtopic(videos, subtopic.name).length > 10 && (
                  <div className="flex justify-center items-center">
                    <Link
                      href={`/topics/${topic}/${subtopic.name.toLowerCase()}`}
                      className="text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 my-6 w-4/5"
                    >
                      See more from {subtopic.name}
                    </Link>
                  </div>
                )}{" "}
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
