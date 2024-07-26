import VideoEmbed from "./VideoEmbed";
import Video from "@/types/Video";
import VideoCard from "./VideoCard";
import VideoDialog from "./VideoDialog";
import LoadingAnimation from "./LoadingAnimation";
import { useEffect, useState } from "react";
import { HandThumbUpIcon } from "@heroicons/react/24/solid";
import { EyeIcon, CalendarIcon } from "@heroicons/react/24/outline";

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
  const [isLoading, setIsLoading] = useState(true);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);

  const openDialog = (video: Video) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo({} as Video);
  };

  const { topic, subtopic, video_id } = params;

  useEffect(() => {
    const apiVideo = async () => {
      console.log("Starting video fetch process");
      try {
        const response = await fetch("/api/videos/" + video_id);
        console.log(`Received response with status: ${response.status}`);
        const data = await response.json();
        if (!response.ok) {
          console.error(
            `HTTP error ${response.status}. Response data:`,
            JSON.stringify(data, null, 2)
          );
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }
        console.log("Successfully fetched video. ", data);
        // Extract videosfrom results
        setVideo(data);
      } catch (error) {
        console.error("Error fetching videos:", error);
        console.error(
          "Error details:",
          JSON.stringify(error, Object.getOwnPropertyNames(error))
        );
        return error;
      } finally {
        console.log("Video fetch process completed");
      }
    };
    apiVideo();
    const apiRelatedVideos = async () => {
      console.log("Starting related videos fetch process");
      try {
        const response = await fetch(
          `/api/videos/?limit=22&topic=${topic}&subtopic=${subtopic}`
        );
        console.log(`Received response with status: ${response.status}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            `HTTP error ${response.status}` + JSON.stringify(data)
          );
        }
        console.log("Successfully fetched videos. Total videos:", data.length);
        
        let receivedVideos = null
        if (data.results){
          const receivedVideos = data.results
        } 
        // Extract videosfrom results
        if (!receivedVideos || receivedVideos < 22) {
          console.log("Not enough videos to fetch related videos. Fetching more...");
          try {
            const response = await fetch(
              `/api/videos/?limit=22&topic=${topic}`
            );
            console.log(`Received response with status: ${response.status}`);
            const data = await response.json();
            if (!response.ok) {
              throw new Error(
                `HTTP error ${response.status}` + JSON.stringify(data)
              );
            }
            console.log(
              "Successfully fetched videos. Total videos:",
              data.length
            );
            // Extract videosfrom results and add to receivedVideos
            if (!receivedVideos){
              receivedVideos = data.results
            } else {
              receivedVideos = [...receivedVideos,...data.results]
            }
          } catch (error) {
            console.error("Error fetching videos:", error);
            return error;
          } finally {
            console.log("Video fetch process completed");
          }
        }
        setRelatedVideos(receivedVideos);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching videos:", error);
        return error;
      } finally {
        console.log("Video fetch process completed");
      }
    };
    apiRelatedVideos();
  }, [topic, subtopic, video_id]);
  return (
    <>
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
                <button className="text-xl flex flex-wrap items-center gap-2 bg-gray-200 text-gray-700 py-1.5 px-3 rounded-full">
                  <HandThumbUpIcon className="w-5 h-5 fill-gray-200 stroke-gray-700 stroke-2" />
                  {video.likes}{" "}
                </button>{" "}
              </div>
            </div>
            <div className="flex flex-col gap-2 bg-neutral-200 rounded-xl p-4">
              <div className="flex flex-wrap justify-between">
                <div className="flex flex-wrap gap-6">
                  <span className="flex flex-wrap items-center gap-1">
                    <EyeIcon className="w-5 h-5" /> {video.views}
                  </span>
                  <span className="flex flex-wrap items-center gap-1">
                    <CalendarIcon className="w-5 h-5" />{" "}
                    {video.publishedAt &&
                      new Date(video.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
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
    </>
  );
}
