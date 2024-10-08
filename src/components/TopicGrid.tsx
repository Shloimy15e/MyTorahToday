"use client";
import TopicCard from "./TopicCard";
import Topic from "@/types/Topic";
import Subtopic from "@/types/Subtopic";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";

export default function TopicGrid(props: {
  topics: Topic[] | Subtopic[];
  areSubtopics: boolean;
  showAll: boolean;
}) {
  const [showMore, setShowMore] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const isTablet = useMediaQuery({ minWidth: 640, maxWidth: 1023 });
  const isLaptop = useMediaQuery({ minWidth: 1024, maxWidth: 1279 });
  const isDesktop = useMediaQuery({ minWidth: 1280, maxWidth: 1535 });
  const isLargeDesktop = useMediaQuery({ minWidth: 1536 });

  return (
    <div>
      <h1 className=" leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
        {props.areSubtopics ? "Subtopics" : "Topics"}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
        {props.showAll
          ? props.topics
              .filter(
                (topic) =>
                  props.areSubtopics || (topic as Topic).subtopics.length > 0
              )
              .map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  isSubtopic={props.areSubtopics}
                />
              ))
          : props.topics
              .filter(
                (topic) =>
                  props.areSubtopics || (topic as Topic).subtopics.length > 0
              )
              .slice(
                0,
                showMore
                  ? props.topics.length
                  : isMobile
                  ? 4
                  : isTablet || isLaptop || isDesktop
                  ? 6
                  : 8
              )
              .map((topic: Topic | Subtopic) => (
                <TopicCard
                  topic={topic}
                  key={topic.id}
                  isSubtopic={props.areSubtopics}
                />
              ))}
      </div>
      {!props.showAll &&
        props.topics.length >
          (isMobile ? 4 : isTablet || isLaptop || isDesktop ? 6 : 10) &&
        !showMore && (
          <div className="flex justify-center mt-6">
            <button
              title={`Load More ${props.areSubtopics ? "Subtopics" : "Topics" }`}
              onClick={() => setShowMore(true)}
              className="md:text-lg bg-primary-blue text-gray-100 text-center font-semibold md:px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-14 md:mx-24 my-6 w-4/5"
            >
              Load More {props.areSubtopics ? "Subtopics" : "Topics"}
            </button>
          </div>
        )}
    </div>
  );
}
