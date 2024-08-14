"use client";
import Header from "@/components/Header";
import MainTopicPage from "@/components/MainTopicPage";
import Footer from "@/components/Footer";

type Props = {
  params: {
    topic: string;
  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default function TopicPage({ params }: Props) {
  return (
    <>
      <Header />
      <MainTopicPage params={params} />
      <Footer />
    </>
  );
}
