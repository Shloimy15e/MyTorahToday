import {
  fetchSubtopicServerByName,
  fetchTopicsServer,
  getVideosBySubtopicNameServer,
  getVideosByTopicsServer,
} from "@/data/videoData";

import Breadcrumbs from "@/components/Breadcrumbs";
import { Error401 } from "@/components/Error401";
import Image from "next/image";
import Topic from "@/types/Topic";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";

const VideoGrid = dynamic(() => import("@/components/VideoGrid"), {
  ssr: false, // Prevent server-side rendering
});
const TopicGrid = dynamic(() => import("@/components/TopicGrid"), {
  ssr: false, // Prevent server-side rendering
});

async function getParshahThisWeek() {
  try {
    const url = new URL("/api/calendars", "https://www.sefaria.org");
    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) return null;

    const data = await response.json();
    const parashaItem = data.calendar_items?.find(
      (item: { title: { en: string } }) => item.title.en === "Parashat Hashavua"
    );
    if (!parashaItem) return null;

    // Sefaria uses hyphens for combined parshiot (e.g. "Tazria-Metzora"),
    // but the DB uses spaces (e.g. "Tazria Metzora"). Normalize to match.
    const parshah = parashaItem.displayValue.en.replace(/-/g, " ");
    return await fetchSubtopicServerByName(parshah);
  } catch (error) {
    console.error("Error fetching parshah this week: ", error);
    return null;
  }
}

export default async function Home() {
  try {
    const authToken = cookies().get("auth_token")?.value || null;
    const parshahThisWeek = await getParshahThisWeek();
    let videosThisParshah = null;
    console.log("Parshah this week: ", parshahThisWeek);
    if (parshahThisWeek) {
      videosThisParshah = await getVideosBySubtopicNameServer(
        parshahThisWeek.name,
        authToken
      );
    }
    const topics = await fetchTopicsServer();
    const videosByTopic =  await Promise.all(
      topics.slice(0, 4).map(async (topic: Topic) => {
        const videos = await getVideosByTopicsServer([topic.id], authToken, 9);
        return { videos, topic };
      })
    );
    if (!videosThisParshah && !topics) {
      throw new Error("500 - Internal Server Error");
    }
    return (
      <>
        <main className="bg-neutral-100 grid grid-cols-1 shadow-inner">
          {/* Hero section */}
          <div className="min-w-screen w-full bg-gray-950">
            <picture className="w-full">
              <source srcSet="/images/banner.webp" type="image/webp" />
              <Image
                src="/images/banner.jpg" // Fallback image
                alt="banner"
                width={1707}
                height={282}
                className="object-cover w-full opacity-85"
              />
            </picture>
          </div>
          {/* Parshah of the week */}
          {parshahThisWeek && videosThisParshah && videosThisParshah.length > 0 && (
            <VideoGrid
              videos={videosThisParshah}
              title={`This week's parshah · ${parshahThisWeek.name}`}
              topic={parshahThisWeek.id}
              topic_name={parshahThisWeek.name}
              showAll={false}
              topicVideos={false}
              showLinkAlways={true}
            />
          )}{" "}
          {/* List of topics */}
          {topics && topics.length > 0 && (
            <TopicGrid topics={topics} areSubtopics={false} showAll={false} />
          )}
          {/* List of videos by topic */}
          {videosByTopic &&
            videosByTopic.length > 0 &&
            videosByTopic.map(({ videos, topic }) => (
              <VideoGrid
                key={topic.id}
                videos={videos}
                title={`${topic.name}`}
                topic={topic.id}
                topic_name={topic.name}
                showAll={false}
                topicVideos={true}
              />
            ))}
        </main>
      </>
    );
  } catch (error: any) {
    if (error.message.includes("401")) {
      console.log(error.message);
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
