import VideoGrid from "@/components/VideoGrid";
import Head from "next/head";
import Link from "next/link";
import { Metadata } from "next";
import { cookies } from "next/headers";

export default async function LikedVideos() {
  const authToken = cookies().get("auth_token")?.value || null;
  try {
    if (!authToken) {
      console.log("You must be logged in to have liked videos");
      throw new Error("You must be logged in to have saved videos");
    }
    const url = `${process.env.BACKEND_URL}/api/videos/?is_liked_by_user=true`;
    console.log(url);
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        authorization: `Token ${authToken}`,
      },
    });
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
  } catch (error) {
    throw error;
  }
}
