"use client";
import Header from "@/components/Header";
import MainVideo from "@/components/MainVideo";
import Footer from "@/components/Footer";

type Props = {
  params: {
    topic: number;
    subtopic: number;
    video_id: string;
  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default function VideoPage({ params }: Props) {
  return (
    <>
      <Header />
      <MainVideo params={params} />
      <Footer />
    </>
  );
}