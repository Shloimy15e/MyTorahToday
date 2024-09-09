"use client";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { IoMdEye } from "react-icons/io";
import { useSessionContext } from "@/context/SessionContext";
import { incrementViewCount } from "@/lib/incrementViewCount";

export default function ViewCount({
  views,
  isViewed,
  videoId
}: {
  views: number;
  isViewed: boolean;
  videoId: number;
}) {
  const [viewCount, setViewCount] = useState(views);
  const [viewed, setViewed] = useState(isViewed);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { session } = useSessionContext();

  useEffect(() => {
    timeoutRef.current = setTimeout(async () => {
      if (session && !viewed && videoId) {
        const response = await incrementViewCount(videoId);
        if (!response.ok) {
          console.error("Failed to increment view count");
        }
        console.log(await response.json());
        setViewed(true);
        setViewCount((prev) => prev + 1);
      }
    }, 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [session, videoId, viewed]);

  return (
    <>
      {viewCount}
      {viewed ? (
        <IoMdEye className="h-5 w-5 text-primary-blue" />
      ) : (
        <EyeIcon className="h-5 w-5 text-gray-600" />
      )}
    </>
  );
}
