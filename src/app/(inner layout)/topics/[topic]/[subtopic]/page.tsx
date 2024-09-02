import { getVideosBySubtopicNameServer } from "@/data/videoData";
import HeroWithTitle from "@/components/ui/HeroWithTitle";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Metadata } from "next";
import SefariaText from "@/components/SefariaText";
import { title } from "process";
import { cookies } from "next/headers";
import { Error401 } from "@/components/Error401";

const VideoGrid = dynamic(() => import("@/components/VideoGrid"), {
  ssr: false, // Prevent server-side rendering
});

type Props = {
  params: {
    topic: string;
    subtopic: string;
  };
};

export const generateMetadata = ({ params }: Props): Metadata => {
  return {
    title: `${
      params.subtopic.charAt(0).toUpperCase() +
      params.subtopic.slice(1).replace("-", " ")
    } - My Torah Today`,
  };
};

async function getSubtopicText(subtopic: string) {
  try {
    const options = { method: "GET", headers: { accept: "application/json" } };

    const response = await fetch(
      `https://www.sefaria.org/api/v3/texts/${subtopic}?return_format=strip_only_footnotes`,
      options
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
    }
    let subtopicTextArray: string[] = [];
    data.versions[0].text.forEach((textSegment: string[]) => {
      const innerSubtopicText = textSegment.join(" ");
      subtopicTextArray.push(innerSubtopicText);
    });
    if (subtopicTextArray.length > 0) {
      return {
        subtopicTextArray,
        title: data.heRef,
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching subtopic text: ", error);
    return null;
  }
}

//Get the topic name from the params and pass it to the getVideosByTopic function
export default async function SubtopicPage({ params }: Props) {
  try {
    const authToken = cookies().get("auth_token")?.value || null;
    const { topic, subtopic } = params;
    const displayTopic = topic.replace(/-/g, " ").replace(/%20/g, " ");
    const displaySubtopic = subtopic.replace(/-/g, " ").replace(/%20/g, " ");
    const videos = await getVideosBySubtopicNameServer(displaySubtopic, authToken, 100);
    const subtopicText = await getSubtopicText(displaySubtopic);

    if (!videos) {
      throw new Error("400 - Bad Request – The request returned undefined");
    }

    if (videos.length === 0) {
      throw new Error("404 - No data was found");
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
              topicVideos={false}
              isThereText={subtopicText ? true : false}
            />
          )}
          {subtopicText && <SefariaText text={subtopicText.subtopicTextArray} title={subtopicText.title} />}
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
  } catch (error: any) {
    if (error.message.includes("401")) {
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
