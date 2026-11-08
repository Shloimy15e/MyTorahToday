"use client";

import { useEffect, useState } from "react";
import { useToast } from "../../context/ToastProvider";
import { toggleLike as serverToggleLike } from "@/data/videoData";
import { useSessionContext } from "@/context/SessionContext";
import { MdOutlineThumbUp, MdThumbUp } from "react-icons/md";

export default function LikeButtonAndCount({ videoId, likes, isLiked }: {
  videoId: number;
  likes: number;
  isLiked: boolean;
}) {
  const [isLikedState, setIsLikedState] = useState(isLiked);
  const [likesCount, setLikesCount] = useState(likes);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { session } = useSessionContext();

  useEffect(() => {
    setIsLikedState(isLiked);
    setLikesCount(likes);
  }, [videoId, isLiked, likes]);

  async function toggleLike() {
    if (isLoading) return;
    if (!session) {
      showToast("Please log in to like a video.", "warning");
      return;
    }
    setIsLoading(true);
    try {
      const response = await serverToggleLike(videoId);
      const data = await response.json();
      if (!response.ok || typeof data.detail !== "string") throw new Error("Like request failed");
      if (data.detail.includes("unliked")) {
        showToast("Video unliked", "success");
        setIsLikedState(false);
        setLikesCount((count) => Math.max(0, count - 1));
      } else if (data.detail.includes("liked")) {
        showToast("Video liked", "success");
        setIsLikedState(true);
        setLikesCount((count) => count + 1);
      }
    } catch {
      showToast("Error liking video", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return <button type="button" title={isLikedState ? "Unlike video" : "Like video"} aria-label={`${isLikedState ? "Unlike" : "Like"} video, ${likesCount} likes`} aria-pressed={isLikedState} aria-busy={isLoading} onClick={toggleLike} disabled={isLoading} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue motion-safe:active:scale-95 motion-reduce:transition-none ${isLikedState ? "border-blue-200 bg-blue-50 text-primary-blue hover:bg-blue-100" : "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"} disabled:cursor-wait disabled:opacity-60`}>
    {isLikedState ? <MdThumbUp aria-hidden="true" className="h-4 w-4" /> : <MdOutlineThumbUp aria-hidden="true" className="h-4 w-4" />}
    <span>{isLoading ? "Updating…" : isLikedState ? "Liked" : "Like"}</span><span className="tabular-nums opacity-70">{likesCount}</span>
  </button>;
}
