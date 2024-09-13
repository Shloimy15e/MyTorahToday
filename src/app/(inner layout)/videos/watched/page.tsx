import VideoGrid from "@/components/VideoGrid";
import Head from "next/head";
import Link from "next/link";
import { Metadata } from "next";
import { cookies } from "next/headers";

export default async function WatchedVideos() {
  const authToken = cookies().get("auth_token")?.value || null;
  try {
    if (!authToken) {
      console.log("You must be logged in to have watched videos");
      throw new Error("You must be logged in to have watched videos");
    }
    const url = `${process.env.BACKEND_URL}/api/videos/?is_viewed_by_user=true`;
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
              title={"Videos you watched"}
              topicName={"watched videos"}
              showAll={true}
              topicVideos={false}
              isThereText={false}
            />
          )}
          {videos && videos.length === 0 && (
            <div className="flex flex-col items-center justify-center h-96">
              <h1 className="text-xl font-bold">No watched videos found</h1>
              <Link
                href="/topics"
                className="md:text-lg bg-primary-blue text-gray-100 text-center font-semibold md:px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-14 md:mx-24 my-6 w-4/5"
              >
                Browse Topics
              </Link>
            </div>
          )}
        </main>
      </>
    );
  } catch (error) {
    throw error;
  }
}
