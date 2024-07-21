import { useState, useEffect } from "react";
import {
  EyeIcon,
  HandThumbUpIcon,
  ClockIcon,
  CalendarIcon,
  ChatBubbleOvalLeftEllipsisIcon
} from "@heroicons/react/24/outline";

export interface Video {
  id: number;
  title: string;
  video_id: string;
  topic: string;
  tags: string[];
  description: string;
}

// A card that has the videoEmbed in it and takes a video from a video list by a parent
function VideoCard(props: { video: Video; onClick: () => void }) {
  const [videoDetails, setVideoDetails] = useState({
    title: props.video.title,
    description: props.video.description,
    likes: 0,
    views: 0,
    duration: "00:00:00",
    topic: props.video.topic,
    thumbnail: `https://img.youtube.com/vi/${props.video.video_id}/0.jpg`,
    uploadDate: "",
  });

  function formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) {
      return duration;
    }

    const hours = parseInt(match[1] || "0") || 0;
    const minutes = parseInt(match[2] || "0") || 0;
    const seconds = parseInt(match[3] || "0") || 0;

    const parts = [];
    if (hours > 0) {
      parts.push(hours.toString().padStart(2, "0"));
    }
    parts.push(minutes.toString().padStart(2, "0"));
    parts.push(seconds.toString().padStart(2, "0"));

    return parts.join(":");
  }

  useEffect(() => {
    const fetchVideoDetails = async () => {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${props.video.video_id}&key=AIzaSyCI-IaqGYTpOAoYohCVPmpoK42SpXADbsA`
      );
      const data = await response.json();
      if (data.items && data.items[0]) {
        setVideoDetails({
          title: data.items[0].snippet.title,
          description: data.items[0].snippet.description,
          likes: data.items[0].statistics.likeCount,
          views: data.items[0].statistics.viewCount,
          duration: data.items[0].contentDetails.duration,
          topic: data.items[0].snippet.tags[0],
          thumbnail: data.items[0].snippet.thumbnails.high.url,
          uploadDate: data.items[0].snippet.publishedAt,
        });
      }
    };

    fetchVideoDetails();
  }, [props.video.video_id]);

  return (
    <div
      onClick={props.onClick}
      className="group relative bg-white w-full h-full rounded-2xl shadow-md pb-3 transition hover:scale-105 hover:cursor-pointer duration-300 grid grid-cols-1 grid-rows-[1fr_auto] overflow-hidden gap-2"
    >
      <div className="w-full aspect-video">
        <img
          src={videoDetails.thumbnail}
          alt="Video Thumbnail"
          className="rounded-t-2xl w-full"
        />
      </div>

      <h1 className="text-xl font-bold text-left my-4 px-5 w-full">
        {videoDetails.title}
      </h1>
      {/* description */}
      <div className="flex flex-wrap justify-center items-center p-2 w-full">
        <p className="text-sm text-gray-700 p-2 rounded-lg m-1">
          {videoDetails.description.slice(0, 200)}...
        </p>
      </div>
      {/* loop through tags */}
      <div className="flex flex-wrap justify-start items-center pl-5 w-full">
        {props.video.tags.map((tag: string) => (
          <p
            key={tag}
            className="text-sm text-gray-600 w-fit p-2 bg-gray-100 rounded-2xl leading-3 m-1"
          >
            {tag}
          </p>
        ))}
      </div>
      {/* likes and views */}
      <div className="flex flex-wrap justify-start items-center mx-4 gap-4 mt-auto">
        <div className="flex flex-wrap justify-start items-center">
          <HandThumbUpIcon className="h-5 w-5 mr-1" />
          <p className="text-sm text-gray-600">{videoDetails.likes}</p>
        </div>
        <div className="flex flex-wrap justify-start items-center">
          <EyeIcon className="h-5 w-5 mr-1" />
          <p className="text-sm text-gray-600">{videoDetails.views}</p>
        </div>
        <div className="flex flex-wrap justify-start items-center">
          <ClockIcon className="h-5 w-5 mr-1" />
          <p className="text-sm text-gray-600">
            {formatDuration(videoDetails.duration)}
          </p>
        </div>
        <div className="flex flex-wrap justify-start items-center">
          <CalendarIcon className="h-5 w-5 mr-1" />
          <p className="text-sm text-gray-600">
            {new Date(videoDetails.uploadDate).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
