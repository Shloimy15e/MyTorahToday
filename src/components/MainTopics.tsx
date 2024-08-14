"use client";
import TopicCard from "./TopicCard";
import { useEffect, useState } from "react";
import Image from "next/image";
import LoadingAnimation from "./LoadingAnimation";

export default function MainTopics() {
  const [topics, setTopics] = useState<{ name: string; id: number }[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(true);
  const [errorFetchingTopics, setErrorFetchingTopics] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      console.log("Fetching topics");
      try {
        const response = await fetch("/api/topics/");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }
        console.log("Topics retrieved: " + data.count);
        setTopics(data.results);
        setIsLoadingTopics(false);
      } catch (error) {
        console.error("Error fetching topics:", error);
        setErrorFetchingTopics(true);
        setIsLoadingTopics(false);
      }
    };
    fetchTopics();
  }, []);
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
        ) : errorFetchingTopics ? (
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
