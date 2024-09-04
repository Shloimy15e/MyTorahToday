import VideoEmbed from "./VideoEmbed";
import Video from "@/types/Video";
import VideoCard from "./VideoCard";
import VideoDialog from "./VideoDialog";
import LoadingAnimation from "./LoadingAnimation";
import { useEffect, useState } from "react";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import {
  EyeIcon,
  CalendarIcon,
  BookmarkIcon,
} from "@heroicons/react/24/outline";

type Props = {
  params: {
    topic: string;
    subtopic: string;
    video_id: string;
  };
};

export default function MainVideo({ params }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video>({} as Video);
  const [video, setVideo] = useState<Video>({} as Video);
  const [videoLikes, setVideoLikes] = useState<number>(0);
  const [videoIsLiked, setVideoIsLiked] = useState<boolean>(false);
  const [videoIsSaved, setVideoIsSaved] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const accessToken = localStorage.getItem("accessToken");

  const openDialog = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo({} as Video);
  };

  const { topic, subtopic, video_id } = params;

  async function likeAndUnlikeVideo(id: Video["id"]) {
    if (!localStorage.getItem("accessToken")) {
      return;
    }
    try {
      const response = await fetch(`/api/videos/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken
            ? {
                Authorization: `Token ${accessToken}`,
              }
            : {}),
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
      }
      if (data.detail.includes("unliked")) {
        // Remove one like from props.video.likes
        setVideoLikes(videoLikes - 1);
        setVideoIsLiked(false);
        console.log("Successfully unliked video");
      } else if (data.detail.includes("liked")) {
        // Add one like to props.video.likes
        setVideoLikes(videoLikes + 1);
        setVideoIsLiked(true);
        console.log("Successfully liked video");
      }
    } catch (error) {
      console.error("Error liking video:", error);
      return error;
    }
  }

  async function saveAndUnsaveVideo(id: Video["id"]) {
    if (!localStorage.getItem("accessToken")) {
      return;
    }
    try {
      const response = await fetch(`/api/videos/${id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken
            ? {
                Authorization: `Token ${accessToken}`,
              }
            : {}),
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
      }
      if (data.detail.includes("unsaved")) {
        // Set videoIsSaved to false
        setVideoIsSaved(false);
        console.log("Successfully unsaved video");
      } else if (data.detail.includes("saved")) {
        // Set videoIsSaved to true
        setVideoIsSaved(true);
        console.log("Successfully saved video");
      }
    } catch (error) {
      console.error("Error liking video:", error);
      return error;
    }
  }

  useEffect(() => {
    const fetchRelatedVideos = async () => {
      console.log("Starting related videos fetch process");
      try {
        if (!topic) {
          throw new Error("Topic ID is missing");
        }
        const response = await fetch(
          `/api/videos/?limit=22&topic__name__iexact=${topic}&subtopic__name__iexact=${subtopic}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(accessToken
                ? {
                    Authorization: `Token ${accessToken}`,
                  }
                : {}),
            },
          }
        );
        console.log(
          `Related videos received response with status: ${response.status}`
        );
        console.log("Response data:", JSON.stringify(response));
        const data = await response.json();
        if (!response.ok) {
          console.error("Error fetching related videos:", data.error);
        }
        console.log(
          "Successfully fetched related videos. Total videos:",
          data.length
        );

        let receivedVideos = null;
        if (data.results) {
          receivedVideos = data.results;
        }
        // Extract videosfrom results
        if (!receivedVideos || receivedVideos < 22) {
          console.log(
            "Not enough videos to fetch related videos. Fetching more..."
          );
          try {
            const response = await fetch(
              `/api/videos/?limit=22&topic__name__iexact=${topic}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  ...(accessToken
                    ? {
                        Authorization: `Token ${accessToken}`,
                      }
                    : {}),
                },
              }
            );
            console.log(
              `Related videos inner received response with status: ${response.status}`
            );
            const data = await response.json();
            if (!response.ok) {
              throw new Error(
                `HTTP error ${response.status}` + JSON.stringify(data)
              );
            }
            console.log(
              "Successfully fetched related videos. Total videos:",
              data.length
            );
            // Extract videosfrom results and add to receivedVideos
            if (!receivedVideos) {
              receivedVideos = data.results;
            } else {
              receivedVideos = [...receivedVideos, ...data.results];
            }
          } catch (error) {
            console.error("Error fetching videos:", error);
            return error;
          }
        }
        setRelatedVideos(receivedVideos);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching related videos: ", error);
        return error;
      }
    };

    const fetchVideo = async () => {
      console.log("Starting video fetch process");
      try {
        const response = await fetch("/api/videos/" + video_id, {
          headers: {
            "Content-Type": "application/json",
            ...(accessToken
              ? {
                  Authorization: `Token ${accessToken}`,
                }
              : {}),
          },
        });
        console.log(`Received response with status: ${response.status}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }
        console.log("Successfully fetched video.");
        // Extract videosfrom results
        setVideo(data);
        setVideoLikes(data.likes + data.userLikes);
        setVideoIsLiked(data.is_liked_by_user);
        console.log("is liked by user", data.is_liked_by_user);
        fetchRelatedVideos();
      } catch (error) {
        console.error("Error fetching videos:", error);
        return error;
      }
    };
    fetchVideo();
  }, [topic, subtopic, video_id, accessToken]);
  return (
    <>
      {isLoading ? (
        <div className="flex flex-col gap-4 w-full aspect-video items-center justify-center">
          <LoadingAnimation />
        </div>
      ) : (
        <main className="grid grid-cols-12 auto-rows-fr gap-10 p-10 px-20 2xl:px-28">
          <div className="flex flex-col gap-4 w-full aspect-video items-center justify-center col-span-8 2xl:col-span-9 row-span-2">
            <VideoEmbed
              src={video_id}
              className="w-full h-full rounded-xl"
              autoplay={false}
            />
            <div className="flex flex-col gap-4">
              <h1 className="text-2xl font-bold">{video.title}</h1>
              {/* likes and views */}
              <div className="flex gap-4">
                <div className="flex gap-2">
                  <button
                    aria-label="Like video"
                    title="Like video"
                    onClick={() => likeAndUnlikeVideo(video.id)}
                    className={`text-xl flex flex-wrap items-center gap-2 ${
                      videoIsLiked
                        ? "bg-primary-blue text-white"
                        : "bg-gray-200 text-gray-700"
                    } py-1.5 px-3 rounded-full`}
                  >
                    <HandThumbUpIcon
                      className={`w-5 h-5 fill-gray-200 ${
                        !videoIsLiked ? "stroke-gray-700" : ""
                      } stroke-2`}
                    />{" "}
                    {videoLikes}{" "}
                  </button>{" "}
                </div>
                <div className="flex gap-2">
                  <button 
                    aria-label="Save video"
                    title="Save video"
                    onClick={() => saveAndUnsaveVideo(video.id)}
                    className={`text-xl flex flex-wrap items-center gap-2 ${
                      videoIsSaved
                        ? "bg-primary-blue text-white"
                        : "bg-gray-200 text-gray-700"
                    } py-1.5 px-3 rounded-full`}  >
                    <BookmarkIcon className="w-5 h-5" />{" "}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 bg-neutral-200 rounded-xl p-4 w-full">
                <div className="flex flex-wrap justify-between">
                  <div className="flex flex-wrap gap-6">
                    <span className="flex flex-wrap items-center gap-1">
                      <EyeIcon className="w-5 h-5" /> {video.views}
                    </span>
                    <span className="flex flex-wrap items-center gap-1">
                      <CalendarIcon className="w-5 h-5" />{" "}
                      {video.publishedAt &&
                        new Date(video.publishedAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-6">
                    <span className="flex flex-wrap items-center gap-1">
                      #{video.topic}
                    </span>
                    <span className="flex flex-wrap items-center gap-1">
                      #{video.subtopic}
                    </span>
                  </div>
                </div>
                <p>{video.description}</p>
              </div>
            </div>
          </div>
          <div className="col-span-4 2xl:col-span-3 row-span-2 grid grid-cols-1 gap-10 justify-items-center place-items-center align-middle w-full">
            {relatedVideos.slice(0, 2).map((video) => {
              return (
                <VideoCard
                  key={video.id}
                  video={video}
                  onClick={() => openDialog(video)}
                  showDescription={false}
                />
              );
            })}
          </div>
          <div className="col-span-12 row-span-7 grid gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10">
              {relatedVideos.slice(2, 20).map((video) => {
                return (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onClick={() => openDialog(video)}
                    showDescription={false}
                  />
                );
              })}
            </div>
          </div>

          <VideoDialog
            isOpen={isDialogOpen}
            onClose={closeDialog}
            video={selectedVideo}
          />
        </main>
      )}
    </>
  );
}
