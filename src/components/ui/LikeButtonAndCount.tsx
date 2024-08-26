"use client";
import Video from "@/types/Video";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useToast } from "../ToastProvider";
import { toggleLike as serverToggleLike } from "@/data/videoData";
import { useSessionContext } from "@/context/SessionContext";

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
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { session } = useSessionContext();

  async function toggleLike() {
    if (!session) {
      showToast("Please log in to like a video.", "error");
      console.log("Please log in to like a video.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await serverToggleLike(videoId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
      }
      if (data.detail.includes("unliked")) {
        console.log("Successfully unliked video");
        showToast("Video unliked", "info");
        setIsLikedState(false);
        setLikesCount(likesCount - 1);
      } else if (data.detail.includes("liked")) {
        showToast("Video liked", "info");
        setIsLikedState(true);
        setLikesCount(likesCount + 1);
      }
    } catch (error) {
      console.error("Error liking video:", error);
      showToast("Error liking video", "error");
      return error;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => {
          toggleLike();
        }}
        disabled={isLoading}
        className={`text-xl flex flex-wrap items-center gap-2 border border-gray-700 ${
          isLikedState
            ? "bg-primary-blue text-white"
            : " "
        } py-1.5 px-3 rounded-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <svg className={`animate-spin h-5 w-5 ${!isLikedState ? 'text-gray-700' : 'text-white'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <HandThumbUpIcon
            className={`w-6 h-5 ${
              isLikedState ? "" : "stroke-gray-700 fill-none"
            } stroke`}
          />
        )}
        {" "}
        {likesCount}{" "}
      </button>{" "}
    </div>
  );
}
