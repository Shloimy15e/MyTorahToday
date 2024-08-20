import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Video from "@/types/Video";
import Image from "next/image";
import TopicGrid from "@/components/TopicGrid";
import dynamic from 'next/dynamic';

const VideoGrid = dynamic(() => import('@/components/VideoGrid'), {
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
const getVideosBySubtopicName = async (subtopic: string): Promise<Video[]> => {
  const limit = 10;
  const response = await fetch(
    `https://www.mytorahtoday.com/api/videos/?limit=${limit}&subtopic__name__iexact=${subtopic}`
  );
  const data = await response.json();
  return data.results;
};

const fetchTopics = async (): Promise<any> => {
  const response = await fetch("https://www.mytorahtoday.com/api/topics/");
  const data = await response.json();
  return data.results;
};

const fetchVideosByTopicName = async (
  topic: string
): Promise<{ topicName: string; videos: Video[] }> => {
  const limit = 6;
  const response = await fetch(
    `https://www.mytorahtoday.com/api/videos/?limit=${limit}&topic__name__iexact=${topic}`
  );
  const data = await response.json();
  return { topicName: topic, videos: data.results };
};

export default async function Home() {
  try {
    const parshahThisWeek = await getParshahThisWeek();
    const videosThisParshah = await getVideosBySubtopicName(parshahThisWeek);
    const topics = await fetchTopics();
    const videosByTopic = await Promise.all(
      topics.slice(0, 4).map(async (topic: any) => {
        const videos = await fetchVideosByTopicName(topic.name);;
        return videos;
      })
    );

    if (!videosThisParshah && !topics) {
      throw new Error("There was a problem fetching the videos");
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
            />
          )}{" "}
          {/* List of topics */}
          {topics && topics.length > 0 && (
            <TopicGrid topics={topics} areSubtopics={false} />
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
