import Breadcrumbs from "@/components/Breadcrumbs";
import HeroWithTitle from "@/components/ui/HeroWithTitle";
import { Metadata } from "next";
import TopicGrid from "@/components/TopicGrid";
import { fetchTopicsServer } from "@/data/videoData";

export const metadata: Metadata = {
  title: "My Torah Today - Topics",
};

export default async function Topics() {
  const topics = await fetchTopicsServer();
  return (
    <main className="min-h-[60vh] bg-stone-50 pb-16">
      <Breadcrumbs segments={[{ href: "topics", label: "Topics" }]} />
      <HeroWithTitle title="Find your next teaching." description="Follow a familiar subject, or make room for something new." />
      <TopicGrid topics={topics} areSubtopics={false} showAll hideTitle />
    </main>
  );
}
