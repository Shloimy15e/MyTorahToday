import {
  fetchSubtopicsServer,
  fetchTopicServer,
  getVideosBySubtopicNameServer,
  getVideosBySubtopicsServer,
} from "@/data/videoData";

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
      params.topicId.charAt(0).toUpperCase() +
      params.topicId.slice(1).replace("-", " ")
    } - My Torah Today`,
  };
};

export default async function TopicPage({ params }: Props) {
  try {
    const authToken = cookies().get("auth_token")?.value || null;
    const { topicId } = params;

    // Fetch topic and subtopics in parallel
    const [topic, subtopics] = await Promise.all([
      fetchTopicServer(topicId),
      fetchSubtopicsServer(topicId),
    ]);
    const displayTopic = topic.name;

    if (!subtopics || subtopics.length === 0) {
      throw new Error("404 - No data was found");
    }

    // Fetch videos for all subtopics in parallel
    const videosBySubtopics = await Promise.all(
      subtopics.map(async (subtopic: Subtopic) => {
        const videos = await getVideosBySubtopicsServer(
          [subtopic.id],
          authToken,
          9
        );
        return { subtopic, videos };
      })
    );

    return (
      <>
        <main className="bg-neutral-100 grid grid-cols-1">
          <HeroWithTitle title={displayTopic} />
          <Breadcrumbs
            segments={[
              { href: "topics", label: "Topics" },
              { href: `topics/${topicId}`, label: displayTopic },
            ]}
          />
          {/* List of topics */}
          <TopicGrid topics={subtopics} areSubtopics={true} showAll={false} />
          {/* List of videos by topic */}
          {videosBySubtopics &&
            videosBySubtopics.length > 0 &&
            videosBySubtopics?.map(
              ({ subtopic, videos }) =>
                videos.length > 0 && (
                  <VideoGrid
                    key={subtopic.id}
                    videos={videos}
                    title={`${subtopic.name}`}
                    topic={subtopic.id}
                    topic_name={subtopic.name}
                    showAll={false}
                    topicVideos={false}
                  />
                )
            )}
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
