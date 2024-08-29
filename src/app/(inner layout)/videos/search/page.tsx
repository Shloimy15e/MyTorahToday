import VideoGrid from "@/components/VideoGrid";
import Head from "next/head";
import Link from "next/link";
import NoResults from "./NoResults";
import { Metadata } from "next";

export async function generateMetadata({ searchParams }: { searchParams: any }): Promise<Metadata> {
  const query = searchParams["query"] || "";
  return {
    title: `Results for "${query}" - My Torah Today`,
    description: `Search results for "${query}" on My Torah Today`,
  };
}

export default async function Search({ searchParams }: { searchParams: any }) {
  const query = searchParams["query"];
  const topic = searchParams["topic"] || "";
  const subtopic = searchParams["subtopic"] || "";
  const url = `${process.env.BACKEND_URL}/api/videos/?search=${query}&topic__name__iexact=${topic}&subtopic__name__iexact=${subtopic}`;
  console.log(url);

  const res = await fetch(url);
  const data = await res.json();
  if (data.count == 0) {
    return <NoResults searchParams={searchParams} />;
  }
  const videos = data.results;
  return (
    <>
      <main>
        {videos && videos.length > 0 && (
          <VideoGrid
            videos={videos}
            title={`${"Results for"} "${query}"
          ${topic && subtopic
            ? " in " + topic + " - " + subtopic
            : topic
            ? " in " + topic
            : subtopic && " in " + subtopic}`}
            topicName={"Results for"}
            showAll={true}
            topicVideos={false}
            isThereText={false}
          />
        )}
      </main>
    </>
  );
}
