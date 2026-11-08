import Link from "next/link";
import HorizontalVideoGrid from "./HorizontalVideoGrid";
import { fetchRelatedVideosServer } from "@/data/videoData";
import { uniqueRelatedVideos } from "./watch-utils";

export default async function RelatedVideosSection({ videoId, topics, subtopics, authToken }: {
  videoId: number;
  topics: (string | number)[];
  subtopics: (string | number)[];
  authToken: string | null;
}) {
  let videos;
  try {
    videos = uniqueRelatedVideos(await fetchRelatedVideosServer(videoId, topics, subtopics, authToken), videoId);
  } catch {
    return <section className="mt-16"><h2 className="learning-display text-3xl text-stone-900">Keep learning</h2><p className="mt-3 text-stone-600">Related teachings couldn’t load. <Link href="/topics" className="inline-flex min-h-11 items-center text-primary-blue underline underline-offset-4">Explore all topics</Link></p></section>;
  }
  if (!videos.length) return null;
  return <section className="mt-16 sm:mt-20" aria-labelledby="related-teachings"><div className="mb-7 flex flex-wrap items-end justify-between gap-3"><h2 id="related-teachings" className="learning-display text-3xl text-stone-900 sm:text-4xl">Continue learning</h2><Link href="/topics" className="inline-flex min-h-11 items-center text-sm font-medium text-primary-blue hover:underline underline-offset-4">Explore all topics</Link></div><HorizontalVideoGrid videos={videos} /></section>;
}
