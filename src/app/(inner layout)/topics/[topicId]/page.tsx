import {
  fetchSubtopicsServer,
  fetchTopicServer,
  getVideosBySubtopicsServer,
} from "@/data/videoData";

import Breadcrumbs from "@/components/Breadcrumbs";
import { Error401 } from "@/components/Error401";
import HeroWithTitle from "@/components/ui/HeroWithTitle";
import { Metadata } from "next";
import Subtopic from "@/types/Subtopic";
import VideoGrid from "@/components/VideoGrid";
import TopicGrid from "@/components/TopicGrid";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{ topicId: string }>;
};

export const generateMetadata = async ({ params }: Props): Promise<Metadata> => {
  const { topicId } = await params;
  const topic = await fetchTopicServer(topicId);
  const title = `${topic.name} - My Torah Today`;
  const description = topic.description?.trim() || `Explore ${topic.name} and related Torah teachings from Rabbi Shimon Semp on My Torah Today.`;
  const url = `https://mytorahtoday.com/topics/${topic.id}`;
  const images = [{ url: "https://mytorahtoday.com/images/social-preview-v2.png", width: 1200, height: 630, alt: "My Torah Today — Torah teachings with Rabbi Shimon Semp" }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "My Torah Today", images },
    twitter: { card: "summary_large_image", title, description, images },
  };
};

export default async function TopicPage({ params }: Props) {
  try {
    const authToken = (await cookies()).get("auth_token")?.value || null;
    const { topicId } = await params;

    // Fetch topic and subtopics in parallel
    const [topic, subtopics] = await Promise.all([
      fetchTopicServer(topicId),
      fetchSubtopicsServer(topicId),
    ]);
    const displayTopic = topic.name;

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
        <main className="min-h-[60vh] bg-stone-50 pb-16">
          <Breadcrumbs
            segments={[
              { href: "topics", label: "Topics" },
              { href: `topics/${topicId}`, label: displayTopic },
            ]}
          />
          <HeroWithTitle title={displayTopic} description={topic.description} />
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
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("401")) {
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
