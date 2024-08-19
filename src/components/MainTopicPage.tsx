"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getVideosBySubtopicName } from "@/data/videoData";
import VideoCard from "@/components/VideoCard";
import LoadingVideoCardAnimation from "./LoadingVideoCardAnimation";
import VideoDialog from "@/components/VideoDialog";
import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import Link from "next/link";
import Video from "@/types/Video";
import TopicCard from "./TopicCard";
import LoadingTopicCardAnimation from "./LoadingTopicCardsAnimation";
import { useMediaQuery } from "react-responsive";

type Props = {
  params: {
    topic: string;
  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default function MainTopicsPage({ params }: Props) {
  const { topic } = params;
  const displayTopic = topic.replace("-", " ");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video>({} as Video);
  const [showMore, setShowMore] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const isTablet = useMediaQuery({ minWidth: 640, maxWidth: 1023 });
  const isLaptop = useMediaQuery({ minWidth: 1024, maxWidth: 1279 });
  const isDesktop = useMediaQuery({ minWidth: 1280, maxWidth: 1535 });
  const isLargeDesktop = useMediaQuery({ minWidth: 1536 });
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [topic, router]);

  const openDialog = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo({} as Video);
  };

  const {
    isLoading: isLoadingSubtopics,
    error: subtopicsError,
    data: subtopicsData,
  } = useQuery(
    "subtopics",
    () =>
      fetch(`/api/subtopics/?topic__name__iexact=${displayTopic}`).then((res) =>
        res.json()
      ),
    { keepPreviousData: false }
  );

  const [subtopics, setSubtopics] = useState([]);

  useEffect(() => {
    if (subtopicsData?.results) {
      // Check if topicsData and results exist
      setSubtopics(subtopicsData.results);
    }
  }, [subtopicsData]); // Run effect whenever topicsData changes

  const {
    isLoading: isLoadingVideosBySubtopics,
    error: videosBySubtopicError,
    data: videosBySubtopics,
  } = useQuery(
    "videosBySubtopic",
    async () => {
      return await Promise.all(
        subtopics.map(async (subtopic: any) => {
          const videos = await getVideosBySubtopicName(subtopic.name);
          return {
            subtopicName: subtopic.name,
            videos: videos,
          };
        })
      );
    },
    { enabled: subtopics.length > 0, keepPreviousData: false }
  );
  console.log(videosBySubtopics?.slice(0, 3));
  return (
    <>
      {/* hero section */}
      <div className="relative w-full bg-gray-950 flex justify-center items-center">
        <Image
          src="/images/banner.jpg"
          alt="banner"
          width={3000}
          height={200}
          className={"object-cover opacity-60"}
        />
        <h1 className="absolute capitalize text-white text-3xl md:text-5xl lg:text-6xl font-bold">
          {displayTopic}
        </h1>
      </div>
      {isLoadingSubtopics || isLoadingVideosBySubtopics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
          {Array.from({ length: 10 }).map((_, index) => (
            <LoadingTopicCardAnimation key={index} isSubtopic={true} />
          ))}
        </div>
      ) : subtopicsError ? (
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-4xl font-bold mb-4">Error fetching videos</h1>
          <p className="text-gray-600 text-xl">
            Sorry, there was an error fetching the videos. Please try again
            later.
          </p>
        </div>
      ) : (
        <>
          {subtopics.length > 0 && (
            <div>
              <h1 className="leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
                {subtopics.length} Subtopics
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                {subtopics
                  .slice(0, showMore ? subtopics.length : 6)
                  .map((subtopic: any) => (
                    <TopicCard
                      key={subtopic.id}
                      subtopic={subtopic}
                      isSubtopic={true}
                    />
                  ))}
              </div>
              {subtopics.length > 6 && !showMore && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowMore(true)}
                    className="text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-24 my-6 w-4/5"
                  >
                    Load More Subtopics
                  </button>
                </div>
              )}
            </div>
          )}
          {isLoadingVideosBySubtopics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
              {Array.from({ length: 10 }).map((_, index) => (
                <LoadingVideoCardAnimation key={index} />
              ))}
            </div>
          ) : videosBySubtopicError ? (
            <div className="flex flex-col items-center justify-center h-64">
              <h1 className="text-4xl font-bold mb-4">Error fetching videos</h1>
              <p className="text-gray-600 text-xl">
                Sorry, there was an error fetching the videos. Please try again
                later.
              </p>
            </div>
          ) : (
            videosBySubtopics?.map(
              ({ subtopicName, videos }) =>
                videos.length > 0 && (
                  <div key={subtopicName}>
                    <h1 className=" leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
                      {subtopicName}
                    </h1>
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
                        {videos
                          .slice(
                            0,
                            isMobile
                              ? 3
                              : isTablet
                              ? 2
                              : isLaptop
                              ? 3
                              : isDesktop
                              ? 4
                              : 5
                          )
                          .map((video: any) => (
                            <VideoCard
                              video={video}
                              key={video.id}
                              onClick={() => openDialog(video)}
                              showDescription={true}
                            />
                          ))}
                      </div>
                      {videos.length >
                        (isMobile
                          ? 3
                          : isTablet
                          ? 2
                          : isLaptop
                          ? 3
                          : isDesktop
                          ? 4
                          : 5) && (
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
        </>
      )}
      <VideoDialog
        video={selectedVideo}
        isOpen={isDialogOpen}
        onClose={closeDialog}
      />
    </>
  );
}
