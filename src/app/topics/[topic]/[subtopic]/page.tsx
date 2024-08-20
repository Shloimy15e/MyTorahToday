import { getVideosBySubtopicName } from "@/data/videoData";
import HeroWithTitle from "@/components/ui/HeroWithTitle";
import dynamic from "next/dynamic";
import Link from "next/link";

const VideoGrid = dynamic(() => import("@/components/VideoGrid"), {
  ssr: false, // Prevent server-side rendering
});

type Props = {
  params: {
    topic: string;
    subtopic: string;
  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default async function SubtopicPage({ params }: Props) {
  try {
    const { topic, subtopic } = params;
    const displayTopic = topic.replace("-%", " ");
    const displaySubtopic = subtopic.replace(/%20/g, " ").replace(/-/g, " ");

    const videos = await getVideosBySubtopicName(displaySubtopic);
    if (!videos || videos.length === 0) {
      throw new Error("There was a problem fetching the videos");
    }

    return (
      <>
        <main className="bg-neutral-100 grid grid-cols-1">
          <HeroWithTitle title={displaySubtopic} />
          {videos && videos.length > 0 && (
            <VideoGrid
              videos={videos}
              title={`${displaySubtopic}`}
              topicName={displaySubtopic}
              showAll={true}
            />
          )}
          <div className="flex justify-center items-center mb-6">
            <Link
              href={`/topics/${topic}`}
              className="text-lg capitalize bg-primary-blue text-gray-100 font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-blue-950"
            >
              Return to {displayTopic}
            </Link>
          </div>
        </main>
      </>
    );
  } catch (error) {
    throw error;
  }
}
