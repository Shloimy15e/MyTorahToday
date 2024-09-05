import {
  EyeIcon,
  ClockIcon,
  CalendarIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import formatDuration from "@/utils/formatDuration";
import Video from "@/types/Video";
import { MdOutlineThumbUp, MdThumbUp } from "react-icons/md";
import SaveButton from "./ui/SaveButton";

// A card that has the videoEmbed in it and takes a video from a video list by a parent
function VideoCard(props: {
  video: Video;
  onClick: () => void;
  showDescription: boolean;
}) {
  return (
    <div className="group bg-white box-border w-full h-full rounded-2xl shadow-md transition hover:scale-105 hover:cursor-pointer duration-300 overflow-hidden ">
      <div className="absolute p-0.5 m-1.5 rounded-full z-10 w-content bg-white bg-opacity-60 group-hover:bg-opacity-100 group-hover:shadow-2xl hover:bg-gray-100 hover:scale-105 active:scale-95 transform duration-200">
        <SaveButton
          videoId={props.video.id}
          isSaved={props.video.is_saved_by_user}
        />
      </div>
      <div onClick={props.onClick} className="h-full w-full group rounded-2xl flex flex-col overflow-hidden gap-3">
        <div className="w-full box-border h-auto max-w-full aspect-video relative">
          <Image
            width={400}
            height={300}
            src={`https://i.ytimg.com/vi/${props.video.video_id}/hqdefault.jpg`}
            alt="Video Thumbnail"
            className="rounded-t-2xl w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <PlayIcon className="w-11 h-11 text-white bg-opacity-65 group-hover:bg-opacity-100 transition duration-300 bg-primary-blue rounded-full p-2 fill-current absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-left px-5 w-full">
          {props.video.title}
        </h1>
        {/* description */}
        {props.showDescription && (
          <div className="px-4 w-full">
            <p className="text-sm text-gray-700 w-full overflow-hidden">
              {props.video.description.toLowerCase().startsWith("subscribe")
                ? props.video.description
                : `${props.video.description.slice(0, 250)}...`}
            </p>
          </div>
        )}
        {/* likes and views */}
        <div className="flex justify-center items-center px-6 gap-1 md:gap-2 lg:gap-1 xl:gap-2 mt-auto pt-2 border-t border-gray-200 mb-2">
          <div className="flex justify-start items-center gap-1 text-gray-600">
            {props.video.is_liked_by_user ? (
              <MdThumbUp className="h-4 w-4 text-primary-blue" />
            ) : (
              <MdOutlineThumbUp className="h-4 w-4 text-gray-600" />
            )}
            <p className="pr-1 md:pr-2 lg:pr-1 xl:pr-2 border-r border-gray-300">
              {props.video.likes + props.video.userLikes}
            </p>
          </div>
          <div className="flex justify-start items-center text-gray-600 gap-1">
            <EyeIcon className="h-5 w-5" />
            <p className="text-sm pr-1 md:pr-2 lg:pr-1 xl:pr-2 border-r border-gray-300">
              {props.video.views}
            </p>
          </div>
          <div className="flex gap-1 justify-start items-center text-gray-600">
            <ClockIcon className="h-5 w-5" />
            <p className="text-sm pr-1 md:pr-2 lg:pr-1 xl:pr-2 border-r border-gray-300">
              {formatDuration(props.video.duration)}
            </p>
          </div>
          <div className="flex justify-start items-center gap-1 text-gray-600">
            <CalendarIcon className="h-5 w-5" />
            <p className="text-sm">
              {props.video.publishedAt
                ? new Intl.DateTimeFormat("en-US", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(new Date(props.video.publishedAt))
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
