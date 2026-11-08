"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRightIcon, CheckIcon, PlayIcon } from "@heroicons/react/24/outline";
import Video from "@/types/Video";
import formatDuration from "@/utils/formatDuration";
import VideoEmbed from "./VideoEmbed";
import SaveButton from "./ui/SaveButton";

export default function SubtopicVideoLibrary({ videos, featured }: { videos: Video[]; featured: Video | null }) {
  const collection = featured ? [featured, ...videos.filter(video => video.id !== featured.id)] : videos;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [playingId, setPlayingId] = useState<number | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const selected = collection.find(video => video.id === selectedId) || collection[0];
  if (!selected) return null;

  function watch(video: Video) {
    setSelectedId(video.id);
    setPlayingId(video.id);
    requestAnimationFrame(() => {
      playerRef.current?.focus({ preventScroll: true });
      playerRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  }

  return (
    <section id="watch" aria-labelledby="watch-heading" className="scroll-mt-28">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="watch-heading" className="learning-display text-3xl tracking-tight text-stone-900 sm:text-4xl">Watch & reflect</h2>
        <span className="text-sm text-stone-600">{featured && selected.id === featured.id ? "Selected to begin with" : "A moment of learning, at your pace"}</span>
      </div>
      <div ref={playerRef} tabIndex={-1} aria-label="Selected teaching" className="learning-feature scroll-mt-28 overflow-hidden rounded-2xl bg-primary-blue shadow-lg shadow-blue-950/10 outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">
        <AnimatePresence initial={false} mode="wait">
          <motion.article key={selected.id} initial={{ opacity: 0, filter: reduceMotion ? "none" : "blur(3px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0.1 : 0.22, ease: [0.16, 1, 0.3, 1] }} className="grid lg:grid-cols-[1.6fr_1fr]">
            <div className="relative aspect-video bg-stone-950">
              {playingId === selected.id ? (
                <VideoEmbed src={selected.video_id} title={selected.title} autoplay className="absolute inset-0 h-full w-full" />
              ) : (
                <button type="button" onClick={() => setPlayingId(selected.id)} aria-label={`Play ${selected.title}`} className="group relative block h-full w-full overflow-hidden focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-white">
                  <Image src={`https://i.ytimg.com/vi/${selected.video_id}/hqdefault.jpg`} alt="" fill sizes="(min-width: 1280px) 720px, (min-width: 1024px) 60vw, 100vw" className="object-cover transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.025] motion-reduce:transform-none" priority />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors duration-300 group-hover:bg-black/20"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary-blue shadow-lg transition-[transform,box-shadow] duration-300 group-hover:scale-110 group-hover:shadow-xl motion-reduce:transform-none"><PlayIcon className="ml-1 h-7 w-7 fill-current" aria-hidden="true" /></span></span>
                  <span className="absolute bottom-4 left-4 rounded-full bg-stone-950/80 px-4 py-2 text-sm font-medium text-white">Play teaching</span>
                </button>
              )}
            </div>
            <div className="flex flex-col justify-between gap-8 p-6 text-white sm:p-8 lg:p-9">
              <div aria-live="polite" aria-atomic="true">
                <h3 className="learning-display text-3xl leading-tight sm:text-4xl">{selected.title}</h3>
                <p className="mt-5 text-sm text-blue-100">Rabbi Shimon Semp<span aria-hidden="true"> · </span><span className="tabular-nums">{formatDuration(selected.duration)}</span></p>
              </div>
              <div className="flex flex-wrap items-center gap-5 border-t border-white/25 pt-5">
                <Link href={`/videos/${selected.id}`} className="learning-detail-link inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white underline-offset-4 hover:underline">Teaching details <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" /></Link>
                <div className="rounded-full bg-white text-stone-900"><SaveButton key={selected.id} videoId={selected.id} isSaved={selected.is_saved_by_user} showLabel /></div>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
      {collection.length > 1 && (
        <div className="mt-10 sm:mt-12">
          <div className="mb-6 flex items-baseline justify-between gap-4">
            <h3 className="learning-display text-3xl text-stone-900">Explore the collection</h3>
            <span className="text-sm tabular-nums text-stone-600">{collection.length} teachings</span>
          </div>
          <div className="grid gap-x-7 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {collection.map(video => (
              <article key={video.id} className="min-w-0">
                <button type="button" onClick={() => watch(video)} aria-pressed={selected.id === video.id} aria-label={`Watch ${video.title}`} className="learning-teaching group block w-full rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">
                  <div className={`relative aspect-video overflow-hidden rounded-xl bg-stone-200 ring-offset-4 transition-shadow duration-300 ${selected.id === video.id ? "ring-2 ring-primary-blue" : "ring-0 group-hover:ring-2 group-hover:ring-stone-300"}`}>
                    <Image src={`https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`} alt="" fill sizes="(min-width: 1280px) 380px, (min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none" />
                    <span className="absolute bottom-3 right-3 rounded bg-stone-950/90 px-2 py-1 text-xs tabular-nums text-white">{formatDuration(video.duration)}</span>
                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/15"><PlayIcon className="h-10 w-10 translate-y-2 rounded-full bg-white p-2 text-primary-blue opacity-0 shadow-md transition-[transform,opacity] duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transform-none" aria-hidden="true" /></span>
                  </div>
                  <h4 className="mt-4 text-base font-semibold leading-snug text-stone-900 transition-colors group-hover:text-primary-blue">{video.title}</h4>
                  <span className={`mt-2 inline-flex min-h-6 items-center gap-1.5 text-sm ${selected.id === video.id ? "font-medium text-primary-blue" : "text-stone-600"}`}>{selected.id === video.id ? <><CheckIcon className="h-4 w-4" aria-hidden="true" />Selected teaching</> : "Watch here"}</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
