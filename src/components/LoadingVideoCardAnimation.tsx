import {
  PlayIcon,
} from "@heroicons/react/24/outline";
import { ClockIcon, EyeIcon, CalendarIcon, HandThumbUpIcon as HandThumbUpIconSolid } from "@heroicons/react/24/solid";

// A card that has the videoEmbed in it and takes a video from a video list by a parent
export default function LoadingVideoCardAnimation() {
  return (
    <div className="group relative bg-white w-full h-full rounded-2xl shadow-md transition hover:scale-105 hover:cursor-pointer duration-300 grid grid-rows-[auto_auto_1fr_auto] overflow-hidden gap-3">
      <div className="w-full aspect-video relative">
        <div className="rounded-t-2xl w-full h-full object-cover bg-gray-300 animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayIcon className="w-11 h-11 text-white bg-opacity-65 group-hover:bg-opacity-100 transition duration-300 bg-gray-400 animate-pulse rounded-full p-2 fill-current absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
      <h1 className="text-xl font-bold text-left px-5 w-full">
        <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded-full"></div>
      </h1>
      {/* description */}
      <div className="flex flex-wrap justify-center items-center px-2 w-full gap-2">
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-full"></div>
        <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded-full"></div>
      </div>
      {/* loop through tags */}
      <div className="flex flex-wrap justify-start items-center pl-5 w-full">
        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded-full m-1"></div>
        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded-full m-1"></div>
        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded-full m-1"></div>
      </div>
      {/* likes and views */}
      <div className="flex flex-wrap justify-center items-center mx-4 gap-2 mt-auto pt-2 border-t border-gray-200 mb-2">
        <div className="flex flex-wrap justify-start items-center gap-1 text-gray-400  animate-pulse pr-2 border-r border-gray-300">
            <HandThumbUpIconSolid className="h-5 w-5" />
            <p className="text-sm">
            </p>
        </div>
        <div className="flex flex-wrap justify-start items-center text-gray-400 animate-pulse pr-2 border-r border-gray-300">
          <EyeIcon className="h-5 w-5 mr-1" />
          <p className="text-sm"> </p>
        </div>
        <div className="flex flex-wrap gap-1 justify-start items-center text-gray-400 animate-pulse pr-2 border-r border-gray-300">
          <ClockIcon className="h-5 w-5" />
          <p className="text-sm"> </p>
        </div>
        <div className="flex flex-wrap justify-start items-center gap-1 text-gray-400 animate-pulse">
          <CalendarIcon className="h-5 w-5" />
          <p className="text-sm bg-gray-400"> {" "} </p>
        </div>
      </div>
    </div>
  );
}
