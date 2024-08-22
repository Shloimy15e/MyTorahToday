"use client";
import Video from "@/types/Video";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useToast } from "../ToastProvider";
import { toggleLike as serverToggleLike } from "@/data/videoData";


export default function LikeButtonAndCount({
  videoId,
  likes,
  isLiked,
}: {
  videoId: number;
  likes: number;
  isLiked: boolean;
}) {
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(likes);
  /*async function toggleLike(id: Video["id"]) {
    try {
      const response = await serverToggleLike(videoId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
      }
      if (data.detail.includes("unliked")) {
        console.log("Successfully unliked video");
        setIsLikedState(false);
        setLikesCount(likesCount - 1);
      } else if (data.detail.includes("liked")) {
        // Add one like to props.video.likes
        console.log("Successfully liked video");
        setIsLikedState(true);
        setLikesCount(likesCount + 1);
      }
    } catch (error) {
      console.error("Error liking video:", error);
      return error;
    }
  }*/

  return (
    <div className="flex gap-2">
      <button
        onClick={() => {
          //toggleLike(videoId);
        }}
        className={`text-xl flex flex-wrap items-center gap-2 ${
          isLikedState
            ? "bg-primary-blue text-white"
            : "bg-gray-200 text-gray-700"
        } py-1.5 px-3 rounded-full`}
      >
        <HandThumbUpIcon
          className={`w-5 h-5 fill-gray-200 ${
            isLikedState ? "" : "stroke-gray-700"
          } stroke-2`}
        />{" "}
        {likesCount}{" "}
      </button>{" "}
    </div>
  );
}
