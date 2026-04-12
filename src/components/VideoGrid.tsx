"use client";

import Link from "next/link";
import Video from "@/types/Video";
import VideoCard from "./VideoCard";
import VideoDialog from "./VideoDialog";
import { useMediaQuery } from "react-responsive";
import { useState } from "react";

export default function VideoGrid(props: {
  videos: Video[];
  title: string;
  topic: string | number;
  topic_name: string;
  showAll: boolean;
  topicVideos: boolean;
  showLinkAlways?: boolean;
  isThereText?: boolean;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video>({} as Video);

  const openDialog = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setTimeout(() => {
      setSelectedVideo({} as Video);
    }, 500);
  };

  const isMobile = useMediaQuery({ maxWidth: 639 });
  const isTablet = useMediaQuery({ minWidth: 640, maxWidth: 1023 });
  const isLaptop = useMediaQuery({ minWidth: 1024, maxWidth: 1279 });
  const isDesktop = useMediaQuery({ minWidth: 1280, maxWidth: 1535 });
  const isLargeDesktop = useMediaQuery({ minWidth: 1536 });

  return (
    <>
      <div>
        <div>
          <h1 className={`capitalize leading-relaxed pb-4 relative text-2xl sm:text-3xl md:text-4xl font-bold mx-4 sm:mx-6 md:mx-10 my-4 md:my-6 ${props.isThereText ? 'mb-0' : ''} text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900`}>
            {props.title}
          </h1>
          {props.isThereText && (
            <button
              onClick={() => {
                const component = document.getElementById(
                  "sefaria-text-component"
                );
                if (component) {
                  component.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-base md:text-2xl my-4 md:my-7 font-semibold text-gray-800 mx-4 sm:mx-6 md:mx-10 rounded-lg bg-white w-fit p-2 px-3 shadow-lg"
            >
              See the full script for {props.title.charAt(0).toUpperCase() + props.title.slice(1)}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 lg:gap-10 justify-items-center place-items-center align-middle w-full pt-0 auto-rows-max px-4 sm:px-6 md:px-10 pb-4 sm:pb-6 md:pb-10">
          {props.showAll
            ? props.videos.map((video) => (
                <VideoCard
                  key={video.video_id}
                  video={video}
                  onClick={() => openDialog(video)}
                  showDescription={true}
                />
              ))
            : props.videos.slice(
                  0,
                  isMobile ? 4 : isTablet || isLaptop || isDesktop ? 6 : 8
                )
                .map((video) => (
                  <VideoCard
                    video={video}
                    key={video.id}
                    onClick={() => openDialog(video)}
                    showDescription={true}
                  />
                ))}
        </div>
      </div>
      {(!props.showAll &&
        props.videos.length >
          (isMobile ? 4 : isTablet || isLaptop || isDesktop ? 6 : 8)) ||
      props.showLinkAlways ? (
        <div className="flex justify-center items-center">
          <Link
            href={
              props.topicVideos
                ? `/topics/${props.topic}`
                : `/subtopics/${props.topic}`
            }
            className="text-base md:text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-950 mx-4 sm:mx-14 md:mx-24 my-6 w-full sm:w-auto transition-card"
          >
            See more from {props.topic_name}
          </Link>
        </div>
      ) : null}
      <VideoDialog
        isOpen={isDialogOpen}
        video={selectedVideo}
        onClose={closeDialog}
      />
    </>
  );
}
