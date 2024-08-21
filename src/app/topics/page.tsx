import { Metadata } from "next";
import { fetchTopics } from "@/data/videoData";
import HeroWithTitle from "@/components/ui/HeroWithTitle";
import dynamic from "next/dynamic";
const TopicGrid = dynamic(() => import("@/components/TopicGrid"), {
  ssr: false, // Prevent server-side rendering
});

export const metadata: Metadata = {
  title: "My Torah Today - Topics",
}
export default async function Topics() {
  const topics = await fetchTopics();

  return (
    <>
    <main>
      <HeroWithTitle title="Topics" />
      <TopicGrid topics={topics} areSubtopics={false} showAll={true} />
    </main>
    </>
  );
}