import React from "react";
import TopicSkeleton from "@/components/ui/TopicSkeleton";

export default function Loading() {
  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
        {[...Array(5)].map((_, index) => (
          <TopicSkeleton key={index} isSubtopic={false} />
        ))}
      </div>
    </section>
  );
}
