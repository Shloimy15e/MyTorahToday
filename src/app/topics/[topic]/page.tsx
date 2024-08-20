import MainTopicPage from "@/components/MainTopicPage";
import { Metadata } from "next";

type Props = {
  params: {
    topic: string;
  };
};

export const generateMetadata = ({ params }: Props): Metadata => {
  return {
    title: `My Torah Today - ${params.topic.charAt(0).toUpperCase() + params.topic.slice(1)}`,  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default function TopicPage({ params }: Props) {
  return (
    <>
      <MainTopicPage params={params} />
    </>
  );
}
