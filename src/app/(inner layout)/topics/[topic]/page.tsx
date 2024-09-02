import { Metadata } from "next";
import { getVideosBySubtopicNameServer, fetchSubtopicsServer } from "@/data/videoData";
import HeroWithTitle from "@/components/ui/HeroWithTitle";
import dynamic from "next/dynamic";
import Subtopic from "@/types/Subtopic";
import { cookies } from "next/headers";
import { Error401 } from "@/components/Error401";

const VideoGrid = dynamic(() => import("@/components/VideoGrid"), {
  ssr: false, // Prevent server-side rendering
});

const TopicGrid = dynamic(() => import("@/components/TopicGrid"), {
  ssr: false, // Prevent server-side rendering
});

type Props = {
  params: {
    topic: string;
  };
};

export const generateMetadata = ({ params }: Props): Metadata => {
  return {
    title: `${
      params.topic.charAt(0).toUpperCase() + params.topic.slice(1).replace("-", " ")
    } - My Torah Today`,
  };
};

export default async function TopicPage({ params }: Props) {
  try {
    const authToken = cookies().get("auth_token")?.value || null;
    const { topic } = params;
    const displayTopic = topic.replace("-", " ");
    const subtopics = await fetchSubtopicsServer(displayTopic);
    const videosBySubtopics = await Promise.all(
      subtopics.map(async (subtopic: Subtopic) => {
        const videos = await getVideosBySubtopicNameServer(subtopic.name, authToken);
        return { subtopicName: subtopic.name, videos };
      })
    );
    if(!subtopics){
      throw new Error("400 - Bad Request – The request returned undefined");
    }

    if (subtopics.length === 0) {
      throw new Error("404 - No data was found");      
    }


    return (
      <>
        <main className="bg-neutral-100 grid grid-cols-1">
          <HeroWithTitle title={displayTopic} />
          {/* List of topics */}
          <TopicGrid topics={subtopics} areSubtopics={true} showAll={false} />
          {/* List of videos by topic */}
          {videosBySubtopics &&
            videosBySubtopics.length > 0 &&
            videosBySubtopics.map(({ subtopicName, videos }) => (
              <VideoGrid
                key={subtopicName}
                videos={videos}
                title={`${subtopicName}`}
                topicName={subtopicName}
                showAll={false}
                topicVideos={false}
              />
            ))}
        </main>
      </>
    );
  } catch (error: any) {
    if (error.message.includes("401")) {
      return (
        <>
          <Error401 />
        </>
      );
    } else {
      throw error;
    }
  }
}
