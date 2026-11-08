"use client";

import { useState } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Topic from "@/types/Topic";
import SearchFilter from "@/components/ui/SearchFilter";

export default function SearchForm({ query, topic, subtopic, topics }: { query: string; topic: string; subtopic: string; topics: Topic[] }) {
  const [selectedTopic, setSelectedTopic] = useState(topic || "all");
  const [selectedSubtopic, setSelectedSubtopic] = useState(subtopic || "all");
  const topicOptions = Array.from(new Set([...topics.map(item => item.name), ...(topic ? [topic] : [])]));
  const subtopicOptions = Array.from(new Set([
    ...topics.filter(item => selectedTopic === "all" || item.name === selectedTopic).flatMap(item => (item.subtopics || []).map(child => child.name)),
    ...(selectedSubtopic !== "all" ? [selectedSubtopic] : []),
  ]));

  return (
    <form action="/videos/search" method="get" role="search" className="mt-7 max-w-3xl">
      <label htmlFor="results-query" className="sr-only">Search Torah videos</label>
      <div className="flex gap-2 rounded-xl border border-stone-300 bg-white p-1.5 transition-colors focus-within:border-primary-blue focus-within:ring-2 focus-within:ring-primary-blue/15">
        <input id="results-query" name="query" type="search" required defaultValue={query} placeholder="Search Torah videos" className="min-h-11 min-w-0 flex-1 rounded-lg bg-transparent px-3 text-base text-stone-900 outline-none placeholder:text-stone-500" />
        <button type="submit" className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-blue px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue">
          <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Search</span><span className="sr-only sm:hidden">Search</span>
        </button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SearchFilter label="Filter by topic" allLabel="All topics" value={selectedTopic} options={topicOptions} onChange={value => { setSelectedTopic(value); setSelectedSubtopic("all"); }} />
        <SearchFilter label="Filter by subtopic" allLabel="All subtopics" value={selectedSubtopic} options={subtopicOptions} onChange={setSelectedSubtopic} />
        <input type="hidden" name="topic" value={selectedTopic} disabled={selectedTopic === "all"} />
        <input type="hidden" name="subtopic" value={selectedSubtopic} disabled={selectedSubtopic === "all"} />
        {(topic || subtopic) && <Link href={`/videos/search?${new URLSearchParams({ query })}`} className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-stone-600 underline decoration-stone-300 underline-offset-4 hover:text-primary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">Clear filters</Link>}
      </div>
    </form>
  );
}
