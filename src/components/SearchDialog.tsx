"use client";

import {
  Combobox, ComboboxInput, ComboboxOption, ComboboxOptions,
  Dialog, DialogBackdrop, DialogPanel, DialogTitle,
} from "@headlessui/react";
import {
  ArrowRightIcon, MagnifyingGlassIcon,
  PlayIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Topic from "@/types/Topic";
import Video from "@/types/Video";
import formatDuration from "@/utils/formatDuration";
import SearchFilter from "./ui/SearchFilter";

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
  topics: Topic[];
  initialQuery?: string;
  initialTopic?: string;
  initialSubtopic?: string;
};
type SearchResults = {
  key: string;
  status: "loading" | "ready" | "error";
  videos: Video[];
};

export default function SearchDialog({
  open, onClose, topics, initialQuery = "", initialTopic = "all", initialSubtopic = "all",
}: SearchDialogProps) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [topic, setTopic] = useState(initialTopic);
  const [subtopic, setSubtopic] = useState(initialSubtopic);
  const [results, setResults] = useState<SearchResults>({ key: "", status: "ready", videos: [] });

  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setTopic(initialTopic);
    setSubtopic(initialSubtopic);
  }, [open, initialQuery, initialTopic, initialSubtopic]);

  const trimmedQuery = query.trim();
  const params = new URLSearchParams({ search: trimmedQuery, limit: "8" });
  const allParams = new URLSearchParams({ query: trimmedQuery });
  if (topic !== "all") {
    params.set("topic__name__iexact", topic);
    allParams.set("topic", topic);
    if (subtopic !== "all") {
      params.set("subtopic__name__iexact", subtopic);
      allParams.set("subtopic", subtopic);
    }
  }
  const requestKey = params.toString();
  const allResultsHref = `/videos/search?${allParams}`;

  useEffect(() => {
    if (!open || !trimmedQuery) return;
    const controller = new AbortController();
    setResults({ key: requestKey, status: "loading", videos: [] });
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/videos/?${requestKey}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        if (!Array.isArray(data.results)) throw new Error("Invalid search results");
        if (!controller.signal.aborted) {
          setResults({ key: requestKey, status: "ready", videos: data.results });
        }
      } catch {
        if (!controller.signal.aborted) setResults({ key: requestKey, status: "error", videos: [] });
      }
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, trimmedQuery, requestKey]);

  // Match the current filters before displaying results from an earlier request.
  const current = results.key === requestKey ? results : { status: "loading", videos: [] };
  const visibleVideos = trimmedQuery && current.status === "ready" ? current.videos : [];
  const subtopics = topics.find((item) => item.name === topic)?.subtopics || [];
  const showAllResults = () => {
    if (!trimmedQuery) return;
    router.push(allResultsHref);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} initialFocus={input} className="relative z-[70]">
      <DialogBackdrop transition className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm transition duration-200 data-[closed]:opacity-0 motion-reduce:transition-none" />
      <div className="fixed inset-0 overflow-y-auto px-3 pb-6 pt-[max(20px,8vh)] sm:px-6 sm:pt-[12vh]">
        <DialogPanel transition className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-[#fffefa] text-stone-800 shadow-2xl shadow-stone-950/25 transition duration-200 ease-out data-[closed]:translate-y-2 data-[closed]:scale-[0.98] data-[closed]:opacity-0 motion-reduce:transform-none motion-reduce:transition-none">
          <div className="flex items-center justify-between gap-4 px-5 pt-4 sm:px-6">
            <DialogTitle className="text-sm font-semibold text-stone-600">Search teachings</DialogTitle>
            <button type="button" onClick={onClose} aria-label="Close search" className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue motion-reduce:transition-none">
              <kbd aria-hidden="true" className="hidden text-xs font-sans sm:inline">Esc</kbd>
              <XMarkIcon aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>
          <Combobox<Video | null, false, "div"> as="div" value={null} immediate onChange={(video) => {
            if (!video) return;
            router.push(`/videos/${video.id}`);
            onClose();
          }}>
            {({ activeOption }) => <>
              <div className="flex items-center gap-3 px-5 pb-4 pt-1 sm:px-6">
                <MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-primary-blue" />
                <ComboboxInput
                  ref={input}
                  autoFocus
                  aria-label="Search for a video"
                  placeholder="Search for a video"
                  autoComplete="off"
                  value={query}
                  displayValue={() => query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault();
                      event.stopPropagation();
                      onClose();
                    } else if (event.key === "Enter" && !activeOption && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      showAllResults();
                    }
                  }}
                  className="min-h-12 w-full min-w-0 bg-transparent text-lg text-stone-900 placeholder:text-stone-400 focus:outline-none sm:text-xl"
                />
                {query && <button type="button" onClick={() => { setQuery(""); input.current?.focus(); }} aria-label="Clear search" className="-mr-2 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue motion-reduce:transition-none"><XMarkIcon aria-hidden="true" className="h-4 w-4" /></button>}
              </div>
              <div className="flex flex-wrap items-center gap-2 px-5 pb-5 sm:px-6">
                <SearchFilter label="Filter by topic" allLabel="All topics" value={topic} options={topics.map((item) => item.name)} onChange={(value) => { setTopic(value); setSubtopic("all"); }} />
                {topic !== "all" && subtopics.length > 0 && <SearchFilter label="Filter by subtopic" allLabel="All subtopics" value={subtopic} options={subtopics.map((item) => item.name)} onChange={setSubtopic} />}
              </div>
              <div className="border-t border-stone-200/70 px-3 py-3 sm:px-4">
                <div role="status" aria-live="polite" className="sr-only">
                  {trimmedQuery ? current.status === "loading" ? "Searching teachings" : current.status === "error" ? "Search is unavailable" : `${visibleVideos.length} suggestions available` : "Enter a word or phrase to search"}
                </div>
                {!trimmedQuery ? <div className="px-3 py-8 text-center">
                  <p className="font-medium text-stone-800">A teaching for what’s on your mind</p>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">Enter a word or phrase, or narrow your search by topic.</p>
                  <Link href="/topics" onClick={onClose} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-primary-blue transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue motion-reduce:transition-none">Browse all topics <ArrowRightIcon aria-hidden="true" className="h-4 w-4" /></Link>
                </div> : current.status === "loading" ? <div aria-hidden="true" className="flex min-h-36 items-center justify-center gap-3 text-sm text-stone-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-stone-200 border-t-primary-blue motion-reduce:animate-none" />Searching teachings…</div> : current.status === "error" ? <div className="px-3 py-8 text-center"><p className="font-medium">Search is temporarily unavailable</p><p className="mt-2 text-sm text-stone-500">Try another search in a moment.</p></div> : visibleVideos.length === 0 ? <div className="px-3 py-8 text-center"><p className="font-medium">No teachings found</p><p className="mt-2 text-sm text-stone-500">Try a different phrase or a broader topic.</p></div> : <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-stone-400">Teachings</p>}
                <ComboboxOptions static aria-label="Matching teachings" className="max-h-[min(40vh,360px)] space-y-1 overflow-y-auto overscroll-contain focus:outline-none">
                  {visibleVideos.map((video) => <ComboboxOption key={video.id} value={video} className="group flex min-h-[76px] cursor-pointer items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-stone-100 data-[focus]:bg-blue-50 motion-reduce:transition-none">
                    <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                      <Image src={`https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-medium leading-5 text-stone-800 group-data-[focus]:text-primary-blue">{video.title}</p><p className="mt-1 text-xs text-stone-500">{video.duration ? formatDuration(video.duration) : "Video teaching"}</p></div>
                    <PlayIcon aria-hidden="true" className="mr-1 h-4 w-4 shrink-0 text-stone-400 group-data-[focus]:text-primary-blue" />
                  </ComboboxOption>)}
                </ComboboxOptions>
              </div>
              {trimmedQuery && <div className="flex flex-wrap items-center justify-between gap-2 bg-stone-100/70 px-5 py-2 sm:px-6">
                <span className="hidden text-xs text-stone-500 sm:inline">↑ ↓ to navigate · Enter to open</span>
                <Link href={allResultsHref} onClick={onClose} className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-primary-blue transition-colors hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue motion-reduce:transition-none">View all results <ArrowRightIcon aria-hidden="true" className="h-4 w-4" /></Link>
              </div>}
            </>}
          </Combobox>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
