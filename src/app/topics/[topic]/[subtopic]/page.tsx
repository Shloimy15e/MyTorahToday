"use client";
import MainSubtopics from "@/components/MainSubtopics";

type Props = {
  params: {
    topic: string;
    subtopic: string;
  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default function SubtopicPage({ params }: Props) {
  return (
    <>
      <MainSubtopics params={params} />
    </>
  );
}
