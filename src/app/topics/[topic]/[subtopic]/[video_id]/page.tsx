import { cookies } from "next/headers";
import { fetchRelatedVideos } from "@/data/videoData";
import formatDuration from "@/utils/formatDuration";
import VideoEmbed from "@/components/VideoEmbed";
import VideoDescription from "./components/VideoDescription";
import { CalendarIcon, ClockIcon, EyeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import Video from "@/types/Video";
import LikeButtonAndCount from "@/components/ui/LikeButtonAndCount";
import VerticalVideoGrid from "./components/VerticalVideoGrid";
import HorizontalVideoGrid from "./components/HorizontalVideoGrid";

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
    console.log("authToken", authToken);
    const response = await fetch(
      `https://www.mytorahtoday.com/api/videos/${video_id}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(authToken && { "Authorization": `Token ${authToken}` }),
        },
        cache: "no-store",
      }
    );
    console.log(`Response status: ${response.status}`);
    const video: Video = await response.json();
    const relatedVideos = await fetchRelatedVideos(
      video.topic_name,
      video.subtopic_name,
      authToken
    );
    if (!video || typeof video !== "object") {
      throw new Error("404 - Video not found");
    }
    return (
      <main className="grid grid-cols-1 md:grid-cols-12 gap-8 2xl:gap-10 p-4 video-page-container w-full 2xl:max-w-screen-2xl mx-auto">
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
            </div>
            <div className="flex flex-col gap-4 w-full overflow-clip bg-neutral-200 rounded-xl p-4">
              <div className="flex gap-4 justify-between">
                <div className="flex gap-2">
                  <EyeIcon className="w-5 h-5" />
                  <p>{video.views}</p>
                </div>
                <div className="flex gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  <p>
                    {video.publishedAt &&
                      new Date(video.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ClockIcon className="w-5 h-5" />
                  <p>{formatDuration(video.duration)}</p>
                </div>
              </div>
              <VideoDescription description={video.description} />
            </div>
          </div>
        </div>

        {/* Video Cards Section (Vertical Part of the "L") */}
        <VerticalVideoGrid videos={relatedVideos.slice(0, 2)} />

        {/* Video Cards Section (Horizontal Part of the "L") */}
        <HorizontalVideoGrid videos={relatedVideos.slice(3)} />
      </main>
    );
  } catch (error) {
    throw error;
  }
}
