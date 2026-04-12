import Breadcrumbs from "@/components/Breadcrumbs";
import HeroWithTitle from "@/components/ui/HeroWithTitle";
import { Metadata } from "next";
import TopicGrid from "@/components/TopicGrid";
import { fetchTopicsServer } from "@/data/videoData";

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
          <Breadcrumbs segments={[{href: "topics", label: "Topics"}]} />
          <TopicGrid topics={topics} areSubtopics={false} showAll={true} />
        </main>
      </>
    );
  } catch (error) {
    throw error;
  }
}
