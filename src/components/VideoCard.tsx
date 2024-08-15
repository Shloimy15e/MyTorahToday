import {
  EyeIcon,
  HandThumbUpIcon,
  ClockIcon,
  CalendarIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import { HandThumbUpIcon as HandThumbUpIconSolid } from "@heroicons/react/24/solid";
import Image from "next/image";
import formatDuration from "@/utils/formatDuration";
import Video from "@/types/Video";

// A card that has the videoEmbed in it and takes a video from a video list by a parent
function VideoCard(props: {
  video: Video;
  onClick: () => void;
  showDescription: boolean;
}) {
  return (
    <div
      onClick={props.onClick}
      className="group relative bg-white w-full h-full rounded-2xl shadow-md transition hover:scale-105 hover:cursor-pointer duration-300 grid grid-rows-[auto_auto_1fr_auto] overflow-hidden gap-3"
    >
      <div className="w-full aspect-video relative">
        <Image
          width={400}
          height={400}
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
        <div className="flex flex-wrap justify-center items-center px-2 w-full">
          <p className="text-sm text-gray-700 px-2 rounded-lg mx-1">
            {props.video.description.toLowerCase().startsWith("subscribe")
              ? props.video.description
              : `${props.video.description.slice(0, 250)}...`}
          </p>
        </div>
      )}
      {/* loop through tags */}
      {props.video.tags &&
        props.video.tags.length > 0 &&
        props.video.tags[0].length > 0 && (
          <div className="flex flex-wrap justify-start items-center pl-5 w-full">
            {props.video.tags.map((tag: string) => (
              <p
                key={tag}
                className="text-sm text-gray-600 w-fit p-2 bg-gray-100 rounded-2xl leading-3 m-1"
              >
                {tag}
              </p>
            ))}
          </div>
        )}
      {/* likes and views */}
      <div className="flex flex-wrap justify-center items-center mx-4 gap-2 mt-auto pt-2 border-t border-gray-200 mb-2">
        <div
          className={`flex flex-wrap justify-start items-center gap-1 ${
            props.video.likes + props.video.userLikes > 0
              ? "text-gray-600 font-semibold"
              : "text-gray-400"
          }`}
        >
          <p className="flex flex-wrap justify-start items-center gap-1">
            {props.video.is_liked_by_user ? (
              <HandThumbUpIconSolid className="h-5 w-5 text-primary-blue" />
            ) : (
              <HandThumbUpIcon className="h-5 w-5 text-gray-600" />
            )}
            {props.video.likes + props.video.userLikes}
          </p>
        </div>
        <div className="flex flex-wrap justify-start items-center text-gray-600">
          <EyeIcon className="h-5 w-5 mr-1" />
          <p className="text-sm pr-2 border-r border-gray-300">
            {props.video.views}
          </p>
        </div>
        <div className="flex flex-wrap gap-1 justify-start items-center text-gray-600">
          <ClockIcon className="h-5 w-5" />
          <p className="text-sm pr-2 border-r border-gray-300">
            {formatDuration(props.video.duration)}
          </p>
        </div>
        <div className="flex flex-wrap justify-start items-center gap-1 text-gray-600">
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
  );
}

export default VideoCard;
