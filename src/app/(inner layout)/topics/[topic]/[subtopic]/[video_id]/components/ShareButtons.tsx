"use client";
import Video from "@/types/Video";
import {
  EmailShareButton,
  EmailIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "next-share";

export default function ShareButtons({
  video,
  topic,
  subtopic,
}: {
  video: Video;
  topic: string;
  subtopic: string;
}) {
  return (
    <>
      <span title="Share via Email">
        <EmailShareButton
          url={`${
            window.location
          }/topics/${topic.toLowerCase()}/${subtopic.toLowerCase()}/${
            video.video_id
          }`}
          subject={`R' Shimon Semp - ${video.title?.slice(0, 50)}`}
          body={`Check out this video by R' Shimon Semp:
                  ${video.title} ${
            window.location
          }/topics/${topic.toLowerCase()}/${subtopic.toLowerCase()}/${
            video.video_id
          }`}
          blankTarget={true}
        >
          <EmailIcon className="w-9 h-9" round />
        </EmailShareButton>
      </span>
      <span title="Share on Whatsapp">
        <WhatsappShareButton
          url={`${
            process.env.NEXT_PUBLIC_BASE_URL
          }/topics/${topic.toLowerCase()}/${subtopic.toLowerCase()}/${
            video.video_id
          }`}
          title={`R' Shimon Semp - ${video.title?.slice(0, 50)}`}
          separator=":: "
          blankTarget={true}
        >
          <WhatsappIcon className="w-9 h-9" round />
        </WhatsappShareButton>
      </span>
    </>
  );
}
