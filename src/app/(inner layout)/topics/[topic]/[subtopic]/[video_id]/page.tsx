import { cookies } from "next/headers";
import { fetchRelatedVideosServer } from "@/data/videoData";
import formatDuration from "@/utils/formatDuration";
import VideoEmbed from "@/components/VideoEmbed";
import VideoDescription from "./components/VideoDescription";
import {
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Video from "@/types/Video";
import LikeButtonAndCount from "@/components/ui/LikeButtonAndCount";
import VerticalVideoGrid from "./components/VerticalVideoGrid";
import HorizontalVideoGrid from "./components/HorizontalVideoGrid";
import dynamic from "next/dynamic";
import { Suspense, lazy } from "react";
import LoadingVideoCardAnimation from "@/components/LoadingVideoCardAnimation";
import SaveButton from "@/components/ui/SaveButton";
import { Error401 } from "@/components/Error401";

type Props = {
  params: {
    topic: string;
    subtopic: string;
    video_id: string;
  };
};

//Get the topic name from the params and pass it to the getVideosByTopic function
export default async function VideoPage({ params }: Props) {
  try {
    const { topic, subtopic, video_id } = params;
    const authToken = cookies().get("auth_token")?.value || null;
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/videos/${video_id}/`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { Authorization: `Token ${authToken}` }),
          cache: "no-store",
        },
      }
    );
    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      if (typeof response === "object") {
        throw new Error(
          `${response.status} ${response.statusText} - ${JSON.stringify(
            await response.json()
          )}`
        );
      }
      throw new Error("404 - Video not found");
    }
    const video: Video = await response.json();
    if (!video || typeof video !== "object") {
      throw new Error("404 - Video not found");
    }
    return (
      <main className="grid grid-cols-1 md:grid-cols-12 gap-8 2xl:gap-10 p-3 md:p-4 video-page-container w-full 2xl:max-w-screen-2xl mx-auto">
        {/* Main Video Section */}
        <div className="md:col-span-12 lg:col-span-9 row-span-2">
          <div className="aspect-video w-full">
            <VideoEmbed
              src={video_id}
              className="w-full h-full rounded-xl"
              autoplay={false}
            />
          </div>
          {/* Video Info */}
          <div className="mt-4 flex-col flex gap-4">
            <h1 className="text-2xl font-bold">{video.title}</h1>
            <div className="flex gap-4">
              <LikeButtonAndCount
                likes={video.likes + video.userLikes}
                isLiked={video.is_liked_by_user}
                videoId={video.id}
              />
              <SaveButton videoId={video.id} isSaved={video.is_saved_by_user} />
            </div>
            <div className="flex flex-col gap-4 w-full overflow-clip max-h-full bg-neutral-200 rounded-xl p-4">
              <div className="md:px-4 my-2 flex flex-col gap-2 md:flex-row items-start justify-between w-full">
                <span className="text-gray-500">
                  <Link
                    href={`/topics/${video.topic_name.toLowerCase()}`}
                    className=" hover:underline"
                  >
                    {video.topic_name}
                  </Link>{" "}
                  -{" "}
                  <Link
                    href={`/topics/${video.topic_name.toLowerCase()}/${video.subtopic_name.toLowerCase()}`}
                    className=" hover:underline"
                  >
                    {video.subtopic_name}
                  </Link>
                </span>
                <div className="flex justify-between w-full md:w-auto">
                  <span className="text-gray-500 flex items-center justify-start gap-2">
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                    {video.publishedAt
                      ? new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }).format(new Date(video.publishedAt))
                      : "N/A"}
                  </span>
                  <span className="text-gray-500 ml-4 flex items-center justify-center gap-2">
                    {video.views + video.userViews}
                    <EyeIcon
                      className="inline h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </div>
              <VideoDescription description={video.description} />
            </div>
          </div>
        </div>

        {/* Related Videos Section */}
        <Suspense
          fallback={
            <>
              <div className="md:col-span-12 lg:col-span-3 grid md:grid-cols-2 lg:grid-cols-1 gap-4 2xl:gap-8">
                {[...Array(2)].map((_, index) => (
                  <LoadingVideoCardAnimation key={index} />
                ))}
              </div>
              <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-8">
                {[...Array(8)].map((_, index) => (
                  <LoadingVideoCardAnimation key={index} />
                ))}
              </div>
            </>
          }
        >
          <RelatedVideosSection
            topic={video.topic_name}
            subtopic={video.subtopic_name}
            authToken={authToken}
          />
        </Suspense>
      </main>
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

async function RelatedVideosSection({
  topic,
  subtopic,
  authToken,
}: {
  topic: string;
  subtopic: string;
  authToken: string | null;
}) {
  const relatedVideos = await fetchRelatedVideosServer(
    topic,
    subtopic,
    authToken
  );

  return (
    <>
      {/* Video Cards Section (Vertical Part of the "L") */}
      <VerticalVideoGrid videos={relatedVideos.slice(0, 2)} />

      {/* Video Cards Section (Horizontal Part of the "L") */}
      <HorizontalVideoGrid videos={relatedVideos.slice(3)} />
    </>
  );
}
