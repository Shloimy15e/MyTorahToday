import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Video from "@/types/Video";
import Image from "next/image";
import dynamic from 'next/dynamic';
import { fetchTopics, getVideosBySubtopicName, getVideosByTopicName } from "@/data/videoData";

const VideoGrid = dynamic(() => import('@/components/VideoGrid'), {
  ssr: false, // Prevent server-side rendering
});
const TopicGrid = dynamic(() => import('@/components/TopicGrid'), {
  ssr: false, // Prevent server-side rendering
});

async function getParshahThisWeek() {
  try {
    const response = await fetch(
      "https://api.ginzburg.io/zmanim/shabbat?cl_offset=18&lat=32.09&lng=34.86&elevation=0&havdala=tzeis_8_5_degrees"
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
    }
    return data.torah_part;
  } catch (error) {
    console.error("Error fetching parshah this week: ", error);
    throw error; // Re-throw to handle in component
  }
}

export default async function Home() {
  try {
    const parshahThisWeek = await getParshahThisWeek();
    console.log("Parshah this week: ", parshahThisWeek);
    const videosThisParshah = await getVideosBySubtopicName(parshahThisWeek);
    const topics = await fetchTopics();
    const videosByTopic = await Promise.all(
      topics.slice(0, 4).map(async (topic: any) => {
        const videos = await getVideosByTopicName(topic.name, 9);;
        return videos;
      })
    );

    if (!videosThisParshah && !topics) {
      throw new Error("500 - Internal Server Error");
    }
    return (
      <>
        <Header />
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
        <Footer />
      </>
    );
  } catch (error) {
    throw error;
  }
}
