import { fetchSubtopicsServer, fetchTopicServer, getVideosBySubtopicNameServer, getVideosBySubtopicsServer } from "@/data/videoData";

import Breadcrumbs from "@/components/Breadcrumbs";
import { Error401 } from "@/components/Error401";
import HeroWithTitle from "@/components/ui/HeroWithTitle";
import { Metadata } from "next";
import Subtopic from "@/types/Subtopic";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";

const VideoGrid = dynamic(() => import("@/components/VideoGrid"), {
  ssr: false, // Prevent server-side rendering
});

const TopicGrid = dynamic(() => import("@/components/TopicGrid"), {
  ssr: false, // Prevent server-side rendering
});

type Props = {
  params: {
    topicId: string;
  };
};

export const generateMetadata = ({ params }: Props): Metadata => {
  return {
    title: `${
      params.topicId.charAt(0).toUpperCase() + params.topicId.slice(1).replace("-", " ")
    } - My Torah Today`,
  };
};

export default async function TopicPage({ params }: Props) {
  try {
    const authToken = cookies().get("auth_token")?.value || null;
    const { topicId } = params;
    const topic = await fetchTopicServer(topicId);
    const displayTopic = topic.name;
    const subtopics = await fetchSubtopicsServer(topicId);
    const videosBySubtopics = await Promise.all(
      subtopics?.map(async (subtopic: Subtopic) => {
        const videos = await getVideosBySubtopicsServer([subtopic.id], authToken, 9);
        return { subtopic, videos };
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
          <Breadcrumbs segments={[{href: "topics", label: "Topics"}, {href: `topics/${topicId}`, label: displayTopic}]} />
          {/* List of topics */}
          <TopicGrid topics={subtopics} areSubtopics={true} showAll={false} />
          {/* List of videos by topic */}
          {videosBySubtopics &&
            videosBySubtopics.length > 0 &&
            videosBySubtopics?.map(({ subtopic, videos }) => (
              <VideoGrid
                key={subtopic.id}
                videos={videos}
                title={`${subtopic.name}`}
                topic={subtopic.id}
                topic_name={subtopic.name}
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
