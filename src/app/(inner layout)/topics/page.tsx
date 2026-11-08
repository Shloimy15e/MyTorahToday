import Breadcrumbs from "@/components/Breadcrumbs";
import HeroWithTitle from "@/components/ui/HeroWithTitle";
import { Metadata } from "next";
import TopicGrid from "@/components/TopicGrid";
import { fetchTopicsServer } from "@/data/videoData";

export const metadata: Metadata = {
  title: "Topics | My Torah Today",
  description: "Explore Torah topics and teachings from Rabbi Shimon Semp on My Torah Today.",
  alternates: { canonical: "https://mytorahtoday.com/topics" },
  openGraph: {
    title: "Topics | My Torah Today",
    description: "Explore Torah topics and teachings from Rabbi Shimon Semp on My Torah Today.",
    url: "https://mytorahtoday.com/topics",
    type: "website",
    siteName: "My Torah Today",
    images: [{ url: "https://mytorahtoday.com/images/social-preview-v1.png", width: 1200, height: 630, alt: "My Torah Today — Torah teachings with Rabbi Shimon Semp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Topics | My Torah Today",
    description: "Explore Torah topics and teachings from Rabbi Shimon Semp on My Torah Today.",
    images: [{ url: "https://mytorahtoday.com/images/social-preview-v1.png", alt: "My Torah Today — Torah teachings with Rabbi Shimon Semp" }],
  },
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
