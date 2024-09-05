"use client";
import Video from "@/types/Video";
import VideoCard from "./VideoCard";
import VideoDialog from "./VideoDialog";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";

export default function VideoGrid(props: {
  videos: Video[];
  title: string;
  topicName: string;
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
    setSelectedVideo({} as Video);
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
          <h1 className="capitalize leading-relaxed pb-4 relative text-4xl font-bold mx-10 my-6 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
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
              className="text-2xl font-semibold text-gray-800 ml-10 rounded-lg bg-white w-fit p-2 px-3 shadow-lg"
            >
              See the full text for {props.title}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
          {props.showAll
            ? props.videos.map((video) => (
                <VideoCard
                  key={video.video_id}
                  video={video}
                  onClick={() => openDialog(video)}
                  showDescription={true}
                />
              ))
            : props.videos
                .slice(
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
                ? `/topics/${props.topicName.toLowerCase().replace(" ", "-")}`
                : `/topics/${props.videos[0].topic_name
                    .toLowerCase()
                    .replace(" ", "-")}/${props.topicName
                    .toLowerCase()
                    .replace(" ", "-")}`
            }
            className="text-lg bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-24 my-6 w-4/5"
          >
            See more from {props.topicName}
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
