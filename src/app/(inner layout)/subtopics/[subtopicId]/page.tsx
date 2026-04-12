import {
  fetchSubtopicServer,
  getVideosBySubtopicsServer,
} from "@/data/videoData";

import Breadcrumbs from "@/components/Breadcrumbs";
import { Error401 } from "@/components/Error401";
import HeroWithTitle from "@/components/ui/HeroWithTitle";
import Link from "next/link";
import { Metadata } from "next";
import SefariaText from "@/components/SefariaText";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";

const VideoGrid = dynamic(() => import("@/components/VideoGrid"), {
  ssr: false, // Prevent server-side rendering
});

type Props = {
  params: {
    subtopicId: string | number;
  };
};

export const generateMetadata = ({ params }: Props): Metadata => {
  return {
    title: `${params.subtopicId} - My Torah Today`,
  };
};

async function getSubtopicText(subtopicId: string | number) {
  try {
    const subtopic = await fetchSubtopicServer(subtopicId);
    if (!subtopic.sefaria_text) return null;

    const url = new URL(
      `/api/v3/texts/${encodeURIComponent(subtopic.sefaria_text)}`,
      "https://www.sefaria.org"
    );
    url.searchParams.set("return_format", "strip_only_footnotes");

    const response = await fetch(url.toString(), {
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;

    const data = await response.json();
    const subtopicTextArray: string[] = [];
    data.versions?.[0]?.text?.forEach((textSegment: string | string[]) => {
      if (Array.isArray(textSegment)) {
        subtopicTextArray.push(textSegment.join(" "));
      } else {
        subtopicTextArray.push(textSegment);
      }
    });

    if (subtopicTextArray.length === 0) return null;
    return { subtopicTextArray, title: data.heRef };
  } catch {
    return null;
  }
}

//Get the topic name from the params and pass it to the getVideosByTopic function
export default async function SubtopicPage({ params }: Props) {
  try {
    const authToken = cookies().get("auth_token")?.value || null;
    const { subtopicId } = params;
    const subtopic = await fetchSubtopicServer(subtopicId);
    const displaySubtopic = subtopic.name;
    const videos = await getVideosBySubtopicsServer(
      [subtopicId],
      authToken,
      100
    );
    const subtopicText = await getSubtopicText(subtopicId);

    if (!videos) {
      throw new Error("400 - Bad Request – The request returned undefined");
    }

    return (
      <>
        <main className="bg-neutral-100 grid grid-cols-1">
          <HeroWithTitle title={displaySubtopic} />
          <Breadcrumbs
            segments={[
              { href: "topics", label: "Topics" },
              { href: `topics/${subtopic.topic}`, label: subtopic.topic_name },
              { href: `subtopics/${subtopic.id}`, label: displaySubtopic },
            ]}
          />
          {videos && videos.length > 0 && (
            <VideoGrid
              videos={videos}
              title={`${displaySubtopic}`}
              topic={subtopic.topic}
              topic_name={subtopic.topic_name}
              showAll={true}
              topicVideos={false}
              isThereText={subtopicText ? true : false}
            />
          )}
          {subtopicText && (
            <SefariaText
              text={subtopicText.subtopicTextArray}
              title={subtopicText.title}
            />
          )}
          {videos && videos.length === 0 && !subtopicText && (
            <div className="flex justify-center items-center">
              <p className="text-lg text-gray-700">
                There are no videos or text for this subtopic yet.
              </p>
            </div>
          )}
          <div className="flex justify-center items-center mb-6">
            <Link
              href={`/topics/${subtopic.topic}`}
              className="text-lg capitalize bg-primary-blue text-gray-100 font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 hover:bg-blue-950"
            >
              Return to {subtopic.topic_name}
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
