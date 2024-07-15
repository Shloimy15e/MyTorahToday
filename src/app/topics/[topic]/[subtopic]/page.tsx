"use client";
import Header from "@/components/Header";
import MainSubtopics from "@/components/MainSubtopics";
import Footer from "@/components/Footer";

type Props = {
  params: {
    topic: string;
    subtopic: string;
  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default function TopicPage({ params }: Props) {
  return (
    <>
      <Header />
      <MainSubtopics params={params} />
      <Footer />
    </>
  );
}
