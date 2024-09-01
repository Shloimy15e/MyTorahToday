import { Metadata } from "next";
import { fetchTopicsServer } from "@/data/videoData";
import HeroWithTitle from "@/components/ui/HeroWithTitle";
import dynamic from "next/dynamic";
const TopicGrid = dynamic(() => import("@/components/TopicGrid"), {
  ssr: false, // Prevent server-side rendering
});

export const metadata: Metadata = {
  title: "My Torah Today - Topics",
};

export default async function Topics() {
  try {
    const topics = await fetchTopicsServer();
    if(!topics) {
      throw new Error("500 - There was a serer error fetching topics");
    }

    if (topics.length === 0) {
      throw new Error("404 - No topics found");
    }

    return (
      <>
        <main>
          <HeroWithTitle title="Topics" />
          <TopicGrid topics={topics} areSubtopics={false} showAll={true} />
        </main>
      </>
    );
  } catch (error) {
    throw error;
  }
}
