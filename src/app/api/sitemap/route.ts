// src/app/api/sitemap/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SitemapStream, streamToPromise } from "sitemap";
import { Readable } from "stream";
import {
  fetchTopicsServer,
  getVideosBySubtopicNameServer,
} from "@/data/videoData";
import Topic from "@/types/Topic";
import Subtopic from "@/types/Subtopic";
import Video from "@/types/Video";

export async function GET(req: NextRequest) {
  // Fetch dynamic routes data
  const topics = await fetchTopicsServer();

  const videosBySubtopics = await Promise.all(
    topics.map(async (topic: Topic) => {
      return Promise.all(
        topic.subtopics.map(async (subtopic: Subtopic) => {
          const videos = await getVideosBySubtopicNameServer(
            subtopic.name,
            null,
            100
          );
          console.log("videos for "+ subtopic.name + " " + videos.length);
          return { subtopicName: subtopic.name, videos: videos };
        })
      );
    })
  );
  // Create a stream to write to
  const smStream = new SitemapStream({
    hostname: `${process.env.NEXT_PUBLIC_BASE_URL}`,
  });

  // Add static routes
  smStream.write({ url: "/", changefreq: "daily", priority: 1.0 });
  smStream.write({ url: "/topics", changefreq: "weekly", priority: 0.7 });
  //smStream.write({ url: "/about", changefreq: "monthly", priority: 0.7 });

  // Add dynamic routes
  topics
    .filter((topic: Topic) => topic.subtopics.length > 0)
    .forEach((topic: Topic) => {
      smStream.write({
        url: `/topics/${topic.name.toLowerCase().replace(/\s/g, "-")}`,
        changefreq: "weekly",
        priority: 0.9,
      });
      topic.subtopics.forEach((subtopic: Subtopic) => {
        smStream.write({
          url: `/topics/${topic.name
            .toLowerCase()
            .replace(/\s/g, "-")}/${subtopic.name
            .toLowerCase()
            .replace(/\s/g, "-")}`,
          changefreq: "weekly",
          priority: 0.8,
        });
        videosBySubtopics.forEach((inner) => inner.forEach((video: {subtopicName: string; videos: Video[]}) => {
          if (video.subtopicName === subtopic.name) {
            console.log("videos added " + video.videos.length);
            video.videos.forEach((video: Video) => {
                smStream.write({
                url: `/topics/${topic.name
                  .toLowerCase()
                  .replace(/\s/g, "-")}/${subtopic.name
                  .toLowerCase()
                  .replace(/\s/g, "-")}/${video.video_id}`,
                changefreq: "daily",
                priority: 0.8,
                });
            });
          }
        }));
      });
    });

  // End the stream
  smStream.end();

  // Convert the stream to a promise
  const sitemap = await streamToPromise(Readable.from(smStream)).then((data) =>
    data.toString()
  );

  // Set the response headers
  const headers = new Headers();
  headers.set("Content-Type", "application/xml");
  headers.set("Cache-Control", "s-maxage=600, stale-while-revalidate");

  // Return the sitemap
  return new NextResponse(sitemap, { headers });
}
