import { CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";
import { cache, Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Error401 } from "@/components/Error401";
import LikeButtonAndCount from "@/components/ui/LikeButtonAndCount";
import SaveButton from "@/components/ui/SaveButton";
import VideoEmbed from "@/components/VideoEmbed";
import Video from "@/types/Video";
import formatDuration from "@/utils/formatDuration";
import RelatedVideosSection from "./components/RelatedVideosSection";
import ShareButtons from "./components/ShareButtons";
import VideoDescription from "./components/VideoDescription";
import ViewCount from "./components/ViewCount";

type Props = { params: Promise<{ video_id: string }> };

const getVideo = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) return { video: null, authToken: null, unauthorized: false };
  const authToken = (await cookies()).get("auth_token")?.value || null;
  const response = await fetch(`${process.env.BACKEND_URL}/api/videos/${id}/`, {
    headers: { ...(authToken && { Authorization: `Token ${authToken}` }) },
    cache: "no-store",
  });
  if (response.status === 404) return { video: null, authToken, unauthorized: false };
  if (response.status === 401) return { video: null, authToken, unauthorized: true };
  if (!response.ok) throw new Error("This teaching could not be loaded. Please try again.");
  const video: Video = await response.json();
  return { video: video?.id ? video : null, authToken, unauthorized: false };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { video_id } = await params;
  const { video } = await getVideo(video_id);
  if (!video) return { title: "Teaching unavailable | My Torah Today" };
  const title = `${video.title} | My Torah Today`;
  const description = video.description?.trim().slice(0, 160) || `Watch ${video.title} with Rabbi Shimon Semp.`;
  const url = new URL(`/videos/${video.id}`, process.env.NEXT_PUBLIC_BASE_URL || "https://mytorahtoday.com").href;
  return {
    title, description, alternates: { canonical: url },
    openGraph: {
      title, description, url, type: "video.other",
      images: [{ url: `https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`, alt: video.title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`] },
  };
}

export default async function VideoPage({ params }: Props) {
  const { video_id } = await params;
  const { video, authToken, unauthorized } = await getVideo(video_id);
  if (unauthorized) return <Error401 />;
  if (!video) notFound();
  const publishedDate = video.publishedAt ? new Date(video.publishedAt) : null;

  return (
    <>
      <Breadcrumbs segments={[
        { href: "/topics", label: "Topics" },
        ...(video.subtopics_data?.[0] ? [{ href: `/subtopics/${video.subtopics_data[0].id}`, label: video.subtopics_data[0].name }] : []),
        { href: `/videos/${video.id}`, label: "Watch" },
      ]} />
    <main className="mx-auto w-full max-w-[1440px] px-5 pb-20 pt-7 sm:px-8 lg:px-12 lg:pt-10">
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-10">
        <section aria-label="Video player" className="min-w-0">
          <div className="aspect-video overflow-hidden rounded-2xl bg-stone-900 shadow-[0_12px_35px_-22px_rgba(28,25,23,0.4)] sm:rounded-[1.5rem]">
            <VideoEmbed src={video.video_id} className="h-full w-full" autoplay={false} />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-600">
            {video.duration && <span className="inline-flex items-center gap-1.5"><ClockIcon aria-hidden="true" className="h-4 w-4" />{formatDuration(video.duration)}</span>}
            <span className="inline-flex items-center gap-1.5"><ViewCount views={video.views + video.userViews} isViewed={video.is_viewed_by_user} videoId={video.id} /></span>
            {publishedDate && !Number.isNaN(publishedDate.getTime()) && <time dateTime={video.publishedAt} className="inline-flex items-center gap-1.5"><CalendarDaysIcon aria-hidden="true" className="h-4 w-4" />{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(publishedDate)}</time>}
          </div>
        </section>

        <div className="min-w-0 xl:pt-1">
          <h1 className="font-sans text-2xl font-semibold leading-[1.25] text-stone-900 sm:text-3xl lg:text-[32px]">{video.title}</h1>
          <p className="mt-4 text-base text-stone-600">Rabbi Shimon Semp</p>
          <div className="mt-7 flex flex-wrap items-center gap-2" aria-label="Teaching actions">
            <LikeButtonAndCount likes={video.likes + video.userLikes} isLiked={video.is_liked_by_user} videoId={video.id} />
            <SaveButton videoId={video.id} isSaved={video.is_saved_by_user} showLabel />
            <ShareButtons video={video} />
          </div>
          {video.description?.trim() && <section aria-labelledby="about-teaching" className="mt-9"><h2 id="about-teaching" className="mb-3 text-sm font-semibold text-stone-900">About this teaching</h2><VideoDescription description={video.description} /></section>}
          {(video.topics_data?.length > 0 || video.subtopics_data?.length > 0) && <nav aria-label="Explore this teaching's topics" className="mt-7 flex flex-wrap gap-2">
            {video.topics_data?.map((topic) => <Link key={`topic-${topic.id}`} href={`/topics/${topic.id}`} className="inline-flex min-h-11 items-center rounded-full bg-stone-100 px-3.5 text-sm text-stone-700 transition-colors duration-200 hover:bg-stone-200 motion-reduce:transition-none">{topic.name}</Link>)}
            {video.subtopics_data?.map((subtopic) => <Link key={`subtopic-${subtopic.id}`} href={`/subtopics/${subtopic.id}`} className="inline-flex min-h-11 items-center rounded-full bg-blue-50 px-3.5 text-sm text-primary-blue transition-colors duration-200 hover:bg-blue-100 motion-reduce:transition-none">{subtopic.name}</Link>)}
          </nav>}
        </div>
      </div>

      <Suspense fallback={<div className="mt-16 animate-pulse motion-reduce:animate-none" role="status"><div className="h-8 w-56 rounded bg-stone-200" /><div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((id) => <div key={id} className="aspect-video rounded-2xl bg-stone-200" />)}</div><span className="sr-only">Loading related teachings</span></div>}>
        <RelatedVideosSection videoId={video.id} topics={video.topics} subtopics={video.subtopics} authToken={authToken} />
      </Suspense>
    </main>
    </>
  );
}
