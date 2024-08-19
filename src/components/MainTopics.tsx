"use client";
import TopicCard from "./TopicCard";
import { useEffect, useState } from "react";
import Image from "next/image";
import LoadingAnimation from "./LoadingAnimation";
import { useQuery } from "react-query";

export default function MainTopics() {
  const {
    isLoading: isLoadingTopics,
    error: topicsError,
    data: topicsData,
  } = useQuery("topics", () => fetch("/api/topics/").then((res) => res.json()));

  const [topics, setTopics] = useState<{ name: string; id: number }[]>([]);

  useEffect(() => {
    if (topicsData?.results) {
      // Check if topicsData and results exist
      setTopics(topicsData.results);
    }
  }, [topicsData]); // Run effect whenever topicsData changes

  return (
    <>
      {/* hero secion */}
      <main>
        <div className="relative w-full bg-gray-950 flex justify-center items-center">
          <Image
            src="/images/banner.jpg"
            alt="banner"
            width={30000}
            height={1080}
            className=" object-cover opacity-60"
          />
          <h1 className="absolute text-white text-3xl md:text-5xl lg:text-6xl font-bold">
            Topics
          </h1>
        </div>
        {isLoadingTopics ? (
          <LoadingAnimation />
        ) : topicsError ? (
          <div className="text-red-500">
            Error fetching topics. Please try again later.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} isSubtopic={false} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
