import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Video from "@/types/Video";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  fetchTopicsServer,
  getVideosBySubtopicNameServer,
  getVideosByTopicNameServer,
} from "@/data/videoData";
import { get } from "http";
import SefariaText from "@/components/SefariaText";
import { cookies } from "next/headers";
import { Error401 } from "@/components/Error401";

const VideoGrid = dynamic(() => import("@/components/VideoGrid"), {
  ssr: false, // Prevent server-side rendering
});
const TopicGrid = dynamic(() => import("@/components/TopicGrid"), {
  ssr: false, // Prevent server-side rendering
});

async function getParshahThisWeek() {
  try {
    const apiUrl = `https://www.sefaria.org/api/calendars`;
    const response = await fetch(apiUrl, { cache: "no-cache" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
    }
    return data.calendar_items[0].displayValue.en;
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
        parshahThisWeek,
        authToken
      );
    }
    const topics = await fetchTopicsServer();
    const videosByTopic = await Promise.all(
      topics.slice(0, 4).map(async (topic: any) => {
        return await getVideosByTopicNameServer(topic.name, authToken, 9);
      })
    );
    if (!videosThisParshah && !topics) {
      throw new Error("500 - Internal Server Error");
    }
    return (
      <>
        <main className="bg-neutral-100 grid grid-cols-1">
          {/* Hero section */}
          <div>
            <Image
              src="/images/banner.jpg"
              alt="banner"
              width={30000}
              height={1080}
              className=" object-cover"
            />
          </div>
          {/* Parshah of the week */}
          {videosThisParshah && videosThisParshah.length > 0 && (
            <VideoGrid
              videos={videosThisParshah}
              title={`This week's parshah · ${parshahThisWeek}`}
              topicName={parshahThisWeek}
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
            videosByTopic.map(({ topicName, videos }) => (
              <VideoGrid
                key={topicName}
                videos={videos}
                title={`${topicName}`}
                topicName={topicName}
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
