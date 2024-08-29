"use client";
import Video from "@/types/Video";
import { useState } from "react";
import { useToast } from "../ToastProvider";
import { toggleSave as serverToggleSave } from "@/data/videoData";
import { useSessionContext } from "@/context/SessionContext";
import { IoBookmarkOutline } from "react-icons/io5";

export default function SaveButton({
  videoId,
  isSaved: isSaved,
}: {
  videoId: number;
  isSaved: boolean;
}) {
  const [isSavedState, setIsSavedState] = useState(isSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const { session } = useSessionContext();

  async function toggleSave() {
    if (!session) {
      showToast("Please log in to save a video.", "error");
      console.log("Please log in to save a video.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await serverToggleSave(videoId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
      }
      if (data.detail.includes("unsaved")) {
        console.log("Successfully unsaved video");
        showToast("Video unsaved", "info");
        setIsSavedState(false);
      } else if (data.detail.includes("saved")) {
        showToast("Video saved", "info");
        setIsSavedState(true);
      }
    } catch (error) {
      console.error("Error saving video:", error);
      showToast("Error saving video", "error");
      return error;
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => {
          toggleSave();
        }}
        disabled={isLoading}
        className={`text-xl h-9 aspect-square flex items-center gap-2 border border-gray-700 ${
          isSavedState
            ? "bg-primary-blue text-white"
            : "bg-white"
        } p-1.5  rounded-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <svg className={`animate-spin h-5 w-5 ${!isSavedState ? 'text-gray-700' : 'text-white'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <IoBookmarkOutline
            className={`w-6 h-6 ${
              isSavedState ? "" : "stroke-gray-700 fill-none"
            } stroke`}
          />
        )}
        {" "}
      </button>{" "}
    </div>
  );
}
