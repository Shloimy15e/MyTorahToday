"use client";
import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";
import VideoDialog from "./VideoDialog";
import {
  getVideosByTopicName,
  getVideosBySubtopicName,
} from "@/data/videoData";
import Image from "next/image";
import Link from "next/link";
import Video from "@/types/Video";
import LoadingAnimation from "./LoadingAnimation";

export const parshahThisWeek: string = "Va'eschanon";

export default function Main() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video>({} as Video);
  const [videosByTopic, setVideosByTopic] = useState<
    { topicName: string; videos: Video[] }[]
  >([{ topicName: "", videos: [] }]);
  const [videosThisParshah, setVideosThisParshah] = useState<Video[]>([]);
  const [randomVideos, setRandomVideos] = useState<Video[]>([]);
  const [topics, setTopics] = useState<{ name: string; id: number }[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [isLoadingVideosByTopics, setIsLoadingVideosByTopic] = useState(true);
  const [isLoadingRandomVideos, setIsLoadingRandomVideos] = useState(true);
  const [isLoadingVideosThisParshah, setIsLoadingVideosThisParshah] =
    useState(true);
  const [errorFetchingVideosByTopics, setErrorFetchingVideosByTopics] =
    useState(false);
  const [errorFetchingVideosThisParshah, setErrorFetchingVideosThisParshah] =
    useState(false);
  const [errorFetchingTopics, setErrorFetchingTopics] = useState(false);
  const [errorFetchingRandomVideos, setErrorFetchingRandomVideos] =
    useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      console.log("Fetching topics");
      try {
        const response = await fetch("/api/topics/");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }
        console.log("Topics retrieved: " + data.count);
        setTopics(data.results);
        setIsLoadingTopics(false);
      } catch (error) {
        console.error("Error fetching topics: ", error);
        setErrorFetchingTopics(true);
        setIsLoadingTopics(false);
      }
    };
    fetchTopics();
  }, []);

  useEffect(() => {
    const fetchVideosThisParshah = async () => {
      console.log("Fetching videos for this parshah");
      try {
        const videos = await getVideosBySubtopicName(parshahThisWeek);
        setVideosThisParshah(videos);
        setIsLoadingVideosThisParshah(false);
      } catch (error) {
        console.error("Error fetching videos this parshah: ", error);
        setErrorFetchingVideosThisParshah(true);
        setIsLoadingVideosThisParshah(false);
      }
    };
    fetchVideosThisParshah();
  }, []);

  useEffect(() => {
    const fetchVideosByTopic = async () => {
      try {
        const videosByTopic = await Promise.all(
          topics.map(async (topic) => {
            const videos = await getVideosByTopicName(topic.name);
            return { topicName: topic.name, videos };
          })
        );
        setVideosByTopic(videosByTopic);
        setIsLoadingVideosByTopic(false);
      } catch (error) {
        console.error("Error fetching videos by topic: ", error);
        setErrorFetchingVideosByTopics(true);
        setIsLoadingVideosByTopic(false);
      }
    };
    fetchVideosByTopic();
  }, [topics]);

  useEffect(() => {
    const fetchRandomVideos = async () => {
      try {
        const response = await fetch("/api/videos/");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }
        console.log("Random videos retrieved: " + data.count);
        setRandomVideos(data.results);
        setIsLoadingRandomVideos(false);
      } catch (error) {
        console.error("Error fetching random videos: ", error);
        setErrorFetchingRandomVideos(true);
        setIsLoadingRandomVideos(false);
      }
    };
    fetchRandomVideos();
  }, []);

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
        {/* Parshah of the week */}
        {isLoadingVideosThisParshah ? (
          <div>
            <h1 className=" leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
              {parshahThisWeek}
            </h1>
            <LoadingAnimation />
          </div>
        ) : errorFetchingVideosThisParshah ? (
          <div className="flex flex-col items-center justify-center h-64">
            <h1 className="text-4xl font-bold mb-4">No videos found</h1>
            <p className="text-gray-600">
              Sorry, there was a problem fetching the videos we apologize for
              the inconvenience.
            </p>
          </div>
        ) : (
          <div>
            <h1 className=" leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
              {parshahThisWeek}
            </h1>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                {videosThisParshah.slice(0, 8).map((video) => (
                  <VideoCard
                    video={video}
                    key={video.id}
                    onClick={() => openDialog(video)}
                    showDescription={true}
                  />
                ))}
              </div>
              {videosThisParshah.length > 8 && (
                <div className="flex justify-center items-center">
                  <Link
                    href={`/topics/parshah/${parshahThisWeek.toLowerCase()}`}
                    className="text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-24 my-6 w-4/5"
                  >
                    See more from {parshahThisWeek}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        {/* list of all videos devided by topic */}
        {isLoadingTopics ? (
          <div>
            <h1 className=" leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
              Topics
            </h1>
            <LoadingAnimation />
          </div>
        ) : errorFetchingTopics ? (
          <div className="flex flex-col items-center justify-center h-64">
            <h1 className="text-4xl font-bold mb-4">No topics found</h1>
            {isLoadingRandomVideos ? (
              <LoadingAnimation />
            ) : errorFetchingRandomVideos ? (
              <div className="flex flex-col items-center justify-center h-64">
                <h1 className="text-4xl font-bold mb-4">No videos found</h1>
                <p className="text-gray-600">
                  Sorry, there was a problem fetching the videos we apologize
                  for the inconvenience.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-600">
                  Sorry, there was a problem fetching the topics please enjoy
                  these randomly fetched videos.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                  {randomVideos.slice(0, 8).map((video) => (
                    <VideoCard
                      video={video}
                      key={video.id}
                      onClick={() => openDialog(video)}
                      showDescription={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isLoadingVideosByTopics ? (
          <LoadingAnimation />
        ) : (
          videosByTopic.map(
            ({ topicName, videos }) =>
              videos.length > 0 && (
                <div key={topicName}>
                  <h1 className=" leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
                    {topicName}
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
                          href={`/topics/${topicName.toLowerCase()}`}
                          className="text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-24 my-6 w-4/5"
                        >
                          See more from {topicName}
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )
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
