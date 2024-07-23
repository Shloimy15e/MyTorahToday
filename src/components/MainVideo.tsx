import VideoEmbed from "./VideoEmbed";
import { getVideoByVideo_id } from "@/data/videoData";
import Video from "@/types/Video";
import { videoData } from "@/data/videoData";
import VideoCard from "./VideoCard";
import VideoDialog from "./VideoDialog";
import { useState } from "react";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { EyeIcon, CalendarIcon } from "@heroicons/react/24/outline";
import formatDuration from "@/utils/formatDuration";

type Props = {
  params: {
    topic: string;
    subtopic: string;
    video_id: string;
  };
};

export default function MainVideo({ params }: Props) {
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

  const { topic, subtopic, video_id } = params;
  const video = getVideoByVideo_id(video_id) as Video;
  return (
    <>
      <main className="grid grid-cols-12 auto-rows-fr gap-10 p-10 px-20 2xl:px-28">
        <div className="flex flex-col gap-4 w-full aspect-video items-center justify-center col-span-8 2xl:col-span-9 row-span-2">
          <VideoEmbed
            src={video_id}
            className="w-full h-full rounded-xl"
            autoplay={false}
          />
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            {/* likes and views */}
            <div className="flex gap-4">
              <div className="flex gap-2">
                <button className="text-xl flex flex-wrap items-center gap-2 bg-gray-200 text-gray-700 py-1.5 px-3 rounded-full">
                  <HandThumbUpIcon className="w-5 h-5 fill-gray-200 stroke-gray-700 stroke-2" />
                  {video.likes}{" "}
                </button>{" "}
              </div>
            </div>
            <div className="flex flex-col gap-2 bg-neutral-200 rounded-xl p-4">
              <div className="flex flex-wrap justify-between">
                <div className="flex flex-wrap gap-6">
                  <span className="flex flex-wrap items-center gap-1">
                    <EyeIcon className="w-5 h-5" /> {video.views}
                  </span>
                  <span className="flex flex-wrap items-center gap-1">
                    <CalendarIcon className="w-5 h-5" />{" "}
                    {video.publishedAt &&
                      new Date(video.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-6">
                  <span className="flex flex-wrap items-center gap-1">
                    #{video.topic}
                  </span>
                  <span className="flex flex-wrap items-center gap-1">
                    #{video.subtopic}
                  </span>
                </div>
              </div>
              <p>{video.description}</p>
            </div>
          </div>
        </div>
        <div className="col-span-4 2xl:col-span-3 row-span-2 grid grid-cols-1 gap-10 justify-items-center place-items-center align-middle w-full">
          {videoData.slice(0, 2).map((video) => {
            return (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => openDialog(video)}
                showDescription={false}
              />
            );
          })}
        </div>
        <div className="col-span-12 row-span-7 grid gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10">
            {videoData.slice(0, 20).map((video) => {
              return (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => openDialog(video)}
                  showDescription={false}
                />
              );
            })}
          </div>
        </div>

        <VideoDialog
          isOpen={isDialogOpen}
          onClose={closeDialog}
          video={selectedVideo}
        />
      </main>
    </>
  );
}
