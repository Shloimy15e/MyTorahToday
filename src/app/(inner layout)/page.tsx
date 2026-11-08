import type { Metadata } from "next";
import {
  fetchSubtopicServerByName,
  fetchTopicsServer,
  getVideosBySubtopicsServer,
  getVideosByTopicsServer,
} from "@/data/videoData";

import Subtopic from "@/types/Subtopic";

import { Error401 } from "@/components/Error401";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, PlayIcon } from "@heroicons/react/24/outline";
import Topic from "@/types/Topic";
import VideoGrid from "@/components/VideoGrid";
import TopicGrid from "@/components/TopicGrid";
import { cookies } from "next/headers";
import formatDuration from "@/utils/formatDuration";
import { discoveryCivilDate, DISCOVERY_TIME_ZONE } from "@/utils/discoveryOrder";

export const metadata: Metadata = { alternates: { canonical: "/" } };

async function getParshahThisWeek(): Promise<Subtopic[] | null> {
  try {
    const url = new URL("/api/calendars", "https://www.sefaria.org");
    const [year, month, day] = discoveryCivilDate(new Date()).split("-");
    url.search = new URLSearchParams({ year, month, day, timezone: DISCOVERY_TIME_ZONE }).toString();
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;

    const data = await response.json();
    const parashaItem = data.calendar_items?.find(
      (item: { title: { en: string } }) => item.title.en === "Parashat Hashavua"
    );
    if (!parashaItem) return null;

    const raw = parashaItem.displayValue.en; // e.g. "Tazria-Metzora" or "Lech-Lecha"

    // First try the full name with hyphens replaced by spaces.
    // This handles both two-word names ("Lech Lecha") and combined subtopics ("Tazria Metzora").
    const fullName = raw.replace(/-/g, " ");
    const exactMatch = await fetchSubtopicServerByName(fullName);
    if (exactMatch) return [exactMatch];

    // No exact match — likely two separate parshiot combined with a hyphen.
    // Split and look up each individually.
    const parts = raw.split("-");
    if (parts.length < 2) return null;

    const subtopics = (
      await Promise.all(parts.map((p: string) => fetchSubtopicServerByName(p.trim())))
    ).filter((s): s is Subtopic => s !== null);

    return subtopics.length > 0 ? subtopics : null;
  } catch (error) {
    console.error("Error fetching parshah this week: ", error);
    return null;
  }
}

export default async function Home() {
  try {
    const authToken = (await cookies()).get("auth_token")?.value || null;

    // Fetch parshah and topics in parallel — don't wait for one before starting the other
    const [parshahThisWeek, topics] = await Promise.all([
      getParshahThisWeek(),
      fetchTopicsServer(),
    ]);

    // Now fetch videos for parshah and for each topic in parallel
    const [videosThisParshah, videosByTopic] = await Promise.all([
      parshahThisWeek && parshahThisWeek.length > 0
        ? getVideosBySubtopicsServer(parshahThisWeek.map((s) => s.id), authToken)
        : null,
      Promise.all(
        topics.slice(0, 4).map(async (topic: Topic) => {
          for (const subtopic of topic.subtopics || []) {
            const videos = await getVideosBySubtopicsServer([subtopic.id], authToken, 9);
            if (videos.length > 0) return { videos, topic };
          }
          const videos = await getVideosByTopicsServer([topic.id], authToken, 9);
          return { videos, topic };
        })
      ),
    ]);
    const openingVideo = videosByTopic.find(({ videos }) => videos.length > 0)?.videos[0] ?? videosThisParshah?.[0];
    const parshahCollection = videosThisParshah?.filter(video => video.id !== openingVideo?.id);
    const topicCollections = videosByTopic.map(({ topic, videos }) => ({ topic, videos: videos.filter(video => video.id !== openingVideo?.id) }));

    return (
        <main className="bg-stone-50 pb-10 sm:pb-16">
          <header className={`mx-auto grid w-full max-w-7xl gap-9 px-5 pb-8 pt-10 sm:px-8 sm:pb-10 sm:pt-14 lg:items-center lg:gap-16 lg:px-12 ${openingVideo ? "lg:grid-cols-[0.9fr_1.1fr]" : ""}`}>
            <div>
              <h1 className="learning-display text-5xl leading-[1.04] tracking-tight text-stone-900 sm:text-6xl lg:text-[64px]">Make time<br />for Torah.</h1>
              <p className="mt-5 max-w-[25rem] text-base leading-relaxed text-stone-700 sm:text-lg">Explore short Torah teachings with Rabbi Shimon Semp. Begin with a video or follow a subject that speaks to you, then read the sources and accompanying journals where available.</p>
              <Link href="#topics" className="group mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-primary-blue px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">Explore topics <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" /></Link>
            </div>
            {openingVideo && (
              <Link href={`/videos/${openingVideo.id}`} className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-stone-200 shadow-sm transition-shadow duration-300 group-hover:shadow-lg group-hover:shadow-stone-900/10">
                  <Image src={`https://i.ytimg.com/vi/${openingVideo.video_id}/hqdefault.jpg`} alt="" fill priority sizes="(min-width: 1280px) 580px, (min-width: 1024px) 50vw, (min-width: 640px) 90vw, 100vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025] group-focus-visible:scale-[1.025] motion-reduce:transform-none" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors duration-300 group-hover:bg-black/20 group-focus-visible:bg-black/20"><span className="flex min-h-14 items-center justify-center gap-3 rounded-full bg-white px-5 text-sm font-medium text-primary-blue shadow-md transition-[transform,box-shadow] duration-300 ease-out group-hover:scale-105 group-hover:shadow-xl group-focus-visible:scale-105 motion-reduce:transform-none"><PlayIcon className="h-5 w-5 fill-current" aria-hidden="true" />Watch teaching</span></span>
                </div>
                <div className="flex items-start justify-between gap-5 pt-4">
                  <h2 className="text-lg font-semibold leading-snug text-stone-900 transition-colors duration-200 group-hover:text-primary-blue sm:text-xl">{openingVideo.title}</h2>
                  <span className="shrink-0 pt-1 text-sm tabular-nums text-stone-600">{formatDuration(openingVideo.duration)}</span>
                </div>
              </Link>
            )}
          </header>
          {/* Parshah of the week */}
          {parshahThisWeek && parshahCollection && parshahCollection.length > 0 && (
            <VideoGrid
              videos={parshahCollection}
              title={`This week's parshah · ${parshahThisWeek.map((s) => s.name).join(" / ")}`}
              topic={parshahThisWeek[0].id}
              topic_name={parshahThisWeek[0].name}
              showAll={false}
              topicVideos={false}
              showLinkAlways={true}
            />
          )}
          {/* List of topics */}
          <TopicGrid topics={topics} areSubtopics={false} showAll={false} />
          {/* List of videos by topic */}
          {topicCollections.filter(({ videos }) => videos.length > 0).map(({ videos, topic }) => (
              <VideoGrid
                key={topic.id}
                videos={videos}
                title={`${topic.name}`}
                topic={topic.id}
                topic_name={topic.name}
                showAll={false}
                topicVideos={true}
              />
            ))}
        </main>
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes("401")) {
      return (
        <>
          <Error401 />
        </>
      );
    } else {
      throw error;
    }
  }
}
