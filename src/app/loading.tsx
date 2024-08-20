import React from "react";
import TopicSkeleton from "@/components/ui/TopicSkeleton";

export default function Loading() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(5)].map((_, index) => (
          <TopicSkeleton key={index} isSubtopic={false} />
        ))}
      </div>
    </>
  );
}
