"use client";
import Image from "next/image";
import { getVideosBySubtopicName } from "@/data/videoData";
import VideoCard from "@/components/VideoCard";
import VideoDialog from "@/components/VideoDialog";
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
  const [videosBySubtopics, setVideosBySubtopics] = useState<
    { subtopicName: string; videos: Video[] }[]
  >([]);
  const [subtopics, setSubtopics] = useState<
    { name: string; id: number; subtopic_id: number; subtopic_name: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorFetchingSubtopics, setErrorFetchingSubtopics] = useState(false);
  const [errorFetchingVideos, setErrorFetchingVideos] = useState(false);

  const openDialog = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo({} as Video);
  };

  useEffect(() => {
    const fetchSubtopics = async () => {
      console.log("Fetching topics");
      try {
        const response = await fetch(
          `/api/subtopics/?topic__name__iexact=${topic}`
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }
        console.log("Subtopics retrieved: " + data.count);
        setSubtopics(data.results);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching topics: ", error);
        setErrorFetchingSubtopics(true);
        setIsLoading(false);
      }
    };
    fetchSubtopics();
  }, [topic]);

  useEffect(() => {
    const fetchVideosBySubtopic = async () => {
      try {
        setIsLoading(true);
        const videosBySubtopic = await Promise.all(
          subtopics.map(async (subtopic) => {
            const videos = await getVideosBySubtopicName(subtopic.name);
            return { subtopicName: subtopic.name, videos };
          })
        );
        setVideosBySubtopics(videosBySubtopic);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching videos by topic: ", error);
        setErrorFetchingVideos(true);
        setIsLoading(false);
      }
    };
    fetchVideosBySubtopic();
  }, [subtopics]);

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
      {isLoading ? (
        <LoadingAnimation />
      ) : errorFetchingVideos ? (
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-4xl font-bold mb-4">Error fetching videos</h1>
          <p className="text-gray-600 text-xl">
            Sorry, there was an error fetching the videos. Please try again
            later.
          </p>
        </div>
      ) : (
        videosBySubtopics.map(
          ({ subtopicName, videos }) =>
            videos.length > 0 && (
              <div key={subtopicName}>
                <h1 className=" leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
                  {subtopicName}
                </h1>
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                    {videos.slice(0, 8).map((video) => (
                      <VideoCard
                        video={video}
                        key={video.id}
                        onClick={() => openDialog(video)}
                        showDescription={true}
                      />
                    ))}
                  </div>
                  {videos.length > 11 && (
                    <div className="flex justify-center items-center">
                      <Link
                        href={`${subtopicName.toLowerCase()}`}
                        className="text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-24 my-6 w-4/5"
                      >
                        See more from {subtopicName}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
        )
      )}
      <VideoDialog
        video={selectedVideo}
        isOpen={isDialogOpen}
        onClose={closeDialog}
      />
    </>
  );
}
