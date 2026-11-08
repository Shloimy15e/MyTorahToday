"use client";

import { EyeIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useSessionContext } from "@/context/SessionContext";
import { incrementViewCount } from "@/lib/incrementViewCount";

export default function ViewCount({ views, isViewed, videoId }: {
  views: number;
  isViewed: boolean;
  videoId: number;
}) {
  const [viewCount, setViewCount] = useState(views);
  const [viewed, setViewed] = useState(isViewed);
  const { session } = useSessionContext();

  useEffect(() => {
    setViewCount(views);
    setViewed(isViewed);
  }, [views, isViewed, videoId]);

  useEffect(() => {
    if (!session || viewed || !videoId) return;
    let active = true;
    const timeout = setTimeout(async () => {
      const response = await incrementViewCount(videoId);
      if (response.ok && active) {
        setViewed(true);
        setViewCount((count) => count + 1);
      }
    }, 5000);
    return () => { active = false; clearTimeout(timeout); };
  }, [session, videoId, viewed]);

  return <><EyeIcon aria-hidden="true" className={`h-4 w-4 ${viewed ? "text-primary-blue" : ""}`} /><span className="tabular-nums">{viewCount.toLocaleString()} views</span></>;
}
