import VideoGrid from "@/components/VideoGrid";
import Head from "next/head";
import Link from "next/link";
import { Metadata } from "next";

export default async function LikedVideos() {
  try {
    const url = `${process.env.BACKEND_URL}/api/videos/?is_liked_by_user=true`;
    console.log(url);

    const res = await fetch(url);
    const data = await res.json();
    const videos = data.results;
    if (!videos) {
      throw new Error("No videos were found");
    }
    return (
      <>
        <main>
          {videos && videos.length > 0 && (
            <VideoGrid
              videos={videos}
              title={"Videos you liked"}
              topicName={"liked videos"}
              showAll={true}
              topicVideos={false}
              isThereText={false}
            />
          )}
        </main>
      </>
    );
  } catch (error) {}
}
