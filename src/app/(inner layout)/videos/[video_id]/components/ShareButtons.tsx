"use client";

import {
  EmailIcon,
  EmailShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "next-share";

import Video from "@/types/Video";

export default function ShareButtons({
  video,
}: {
  video: Video;
}) {
  return (
    <>
      <span title="Share via Email">
        <EmailShareButton
          url={`${
            process.env.NEXT_PUBLIC_BASE_URL
          }/videos/${video.id}`}
          subject={`R' Shimon Semp - ${video.title?.slice(0, 50)}`}
          body={`Check out this video by R' Shimon Semp:
                  ${video.title} ${
            process.env.NEXT_PUBLIC_BASE_URL
          }/videos/${video.id}`}
          blankTarget={true}
        >
          <EmailIcon className="w-9 h-9" round />
        </EmailShareButton>
      </span>
      <span title="Share on Whatsapp">
        <WhatsappShareButton
          url={`${
            process.env.NEXT_PUBLIC_BASE_URL
          }/videos/${video.id}`}
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
