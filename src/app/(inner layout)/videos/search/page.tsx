import { Metadata } from "next";
import NoResults from "./NoResults";
import VideoGrid from "@/components/VideoGrid";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: any;
}): Promise<Metadata> {
  const query = searchParams["query"] || "";
  return {
    title: `Results for "${query}" - My Torah Today`,
    description: `Search results for "${query}" on My Torah Today`,
  };
}

export default async function Search({
  searchParams,
}: {
  searchParams: any;
}) {
  const query = searchParams["query"] || "";
  const topic = searchParams["topic"] || "";
  const subtopic = searchParams["subtopic"] || "";

  if (!query.trim()) {
    return <NoResults searchParams={searchParams} />;
  }

  const params = new URLSearchParams();
  params.set("search", query);
  if (topic) params.set("topic__name__iexact", topic);
  if (subtopic) params.set("subtopic__name__iexact", subtopic);

  const url = `${process.env.BACKEND_URL}/api/videos/?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    return <NoResults searchParams={searchParams} />;
  }

  const filterLabel = topic && subtopic
    ? `${topic} \u203a ${subtopic}`
    : topic || subtopic || "";

  return (
    <main className="min-h-[60vh]">
      <VideoGrid
        videos={data.results}
        title={`Results for "${query}"${filterLabel ? ` in ${filterLabel}` : ""}`}
        topic_name="Results"
        topic={0}
        showAll={true}
        topicVideos={false}
        isThereText={false}
      />
    </main>
  );
}
