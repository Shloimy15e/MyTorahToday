"use client";
import Image from "next/image";
import VideoCard from "@/components/VideoCard";
import VideoDialog from "@/components/VideoDialog";
import { useState, useEffect } from "react";
import Link from "next/link";
import Video from "@/types/Video";
import LoadingAnimation from "@/components/LoadingAnimation";

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
  const [videos, setVideos] = useState<Video[]>([]);
  const [subtopicObj, setSubtopicObj] = useState<object>({});
  const [subtopicId, setSubtopicId] = useState<number>(0);
  const [topicId, setTopicId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
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
    const fetchSubtopic = async () => {
      try {
        const response = await fetch(`/api/subtopics?name=${subtopic}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }
        setSubtopicObj(data);
        setSubtopicId(data.id);
        setTopicId(data.topic.id);
      } catch (error) {
        console.error(error);
        return error;
      }
    }

    const fetchVideos = async () => {
      console.log("Starting video fetch process");
      try {
        if (Object.keys(subtopicObj).length === 0) {
          throw new Error("Subtopic object is empty");
        }
        const response = await fetch(
          `/api/videos?limit=100&topic=${topicId}&subtopic=${subtopicId}`
        );
        console.log(`Received response with status: ${response.status}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }
        console.log("Successfully fetched videos. Total videos:", data.length);
        // Extract videosfrom results
        setVideos(data.results);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching videos:", error);
        setErrorFetchingVideos(true);
        setIsLoading(false);
        return error;
      } finally {
        console.log("Video fetch process completed");
      }
    };
    fetchSubtopic();
    fetchVideos();
  }, [topicId, subtopicId, subtopic, subtopicObj]);

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
        ) : videos.length > 0 ? (
          <div>
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
            <div className="flex justify-center items-center">
              <Link
                href={`/topics/${topic}`}
                className="text-lg bg-primary-blue text-gray-100 font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-blue-950"
              >
                Return to {displayTopic}
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center m-2 gap-2">
            <h1 className="text-2xl font-bold">
              No videos found in {displaySubtopic}
            </h1>
            <Link
              href={`/topics/${topic}`}
              className="text-lg bg-primary-blue text-gray-100 font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-blue-950"
            >
              Go back to {displayTopic}
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
