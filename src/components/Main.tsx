"use client";
import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";
import VideoDialog from "./VideoDialog";
import { getVideosByTopic, getVideosBySubtopic } from "@/data/videoData";
import Image from "next/image";
import Link from "next/link";
import { topicData } from "@/data/topicData";
import Video from "@/types/Video";
import LoadingAnimation from "./LoadingAnimation";

export const parshahThisWeek: string = "Balak";

export default function Main() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video>({} as Video);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorFetchingVideos, setErrorFetchingVideos] = useState(false);

  useEffect(() => {
    const apiVideos = async () => {
      console.log("Starting video fetch process");
      try {
        const response = await fetch("/api/videos/?limit=100");
        console.log(`Received response with status: ${response.status}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }
        console.log(JSON.stringify(data));
        console.log(
          "Successfully fetched videos. Total videos:",
          data.results.length
        );
        // Extract videosfrom results
        setVideos(data.results);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setIsLoading(false);
        setErrorFetchingVideos(true);
        return error;
      } finally {
        console.log("Video fetch process completed");
      }
    };
    apiVideos();
  }, []);

  const openDialog = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo({} as Video);
  };

  const videosThisParshah: Video[] = getVideosBySubtopic(
    videos,
    parshahThisWeek
  );

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
          />
        </div>
        {/* list of all videos devided by topic */}
        {isLoading ? (
          <LoadingAnimation />
        ) : errorFetchingVideos ? (
          <div className="flex flex-col items-center justify-center h-64">
            <h1 className="text-4xl font-bold mb-4">Error fetching videos</h1>
            <p className="text-gray-600">
              Sorry, there was an error fetching the videos. Please try again
              later.
            </p>
          </div>
        ) : 
          topicData.length === 0 || topicData.every(topic => getVideosByTopic(videos, topic.name).length === 0) ? (
            <div>
              <h1 className=" leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
                Random
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                {videos.map((video) => (
                  <VideoCard
                    video={video}
                    key={video.id}
                    onClick={() => openDialog(video)}
                    showDescription={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            topicData.map((topic) => {
              const videosInTopic = getVideosByTopic(videos, topic.name);
              return videosInTopic.length === 0 ? null : (              <div key={topic.id}>
                <h1 className=" leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
                  {topic.name}
                </h1>
                {topic.name === "Parshah" && (
                  <>
                    <h2 className="flex relative items-center text-3xl font-semibold mt-2 ml-16 pr-1 text-gray-700 w-max before:content-[''] before:absolute before:left-0 before:bottom-1.5 before:h-2 before:w-full before:bg-gray-900 before:opacity-35">
                      {parshahThisWeek}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                      {videosThisParshah.slice(0, 10).map((video) => (
                        <VideoCard
                          video={video}
                          key={video.id}
                          onClick={() => openDialog(video)}
                          showDescription={true}
                        />
                      ))}
                    </div>
                    {videosThisParshah.length > 10 && (
                      <div className="flex justify-center items-center">
                        <Link
                          href={`/topics/parshah/${parshahThisWeek.toLowerCase()}`}
                          className="text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 my-6 w-4/5"
                        >
                          See more from {parshahThisWeek}
                        </Link>
                      </div>
                    )}
                    <h2 className="flex relative items-center text-3xl font-semibold mt-2 ml-16 pr-1 text-gray-700 w-max before:content-[''] before:absolute before:left-0 before:bottom-1.5 before:h-2 before:w-full before:bg-gray-900 before:opacity-35">
                      Other {topic.name}s
                    </h2>
                  </>
                )}{" "}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                  {videosInTopic.slice(0, 8).map((video) => (
                    <VideoCard
                      video={video}
                      key={video.id}
                      onClick={() => openDialog(video)}
                      showDescription={true}
                    />
                  ))}
                </div>
                {videosInTopic.length > 11 && (
                  <div className="flex justify-center items-center">
                    <Link
                      href={`/topics/${topic.name.toLowerCase()}`}
                      className="text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-24 my-6 w-4/5"
                    >
                      See more from {topic.name}
                    </Link>
                  </div>
                )}
              </div>
            );
          })
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
