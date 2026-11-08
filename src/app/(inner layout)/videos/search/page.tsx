import { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import NoResults from "./NoResults";
import SearchForm from "./SearchForm";
import VideoGrid from "@/components/VideoGrid";
import { Error401 } from "@/components/Error401";
import { fetchTopicsServer } from "@/data/videoData";
import Video from "@/types/Video";

type Params = Record<string, string | string[] | undefined>;
const first = (value: Params[string]) => (Array.isArray(value) ? value[0] : value) || "";

export async function generateMetadata({ searchParams }: { searchParams: Promise<Params> }): Promise<Metadata> {
  const query = first((await searchParams).query).trim();
  return { title: query ? `Results for "${query}" - My Torah Today` : "Search - My Torah Today", description: "Find Torah videos by keyword, topic, and subtopic." };
}

export default async function Search({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const query = first(params.query).trim();
  const topic = first(params.topic);
  const subtopic = first(params.subtopic);
  const requestedPage = Number(first(params.page));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const topics = await fetchTopicsServer().catch(() => []);
  let videos: Video[] = [];
  let failed = false;
  let unauthorized = false;
  let hasNext = false;
  let count: number | undefined;

  if (query) {
    try {
      const url = new URL("/api/videos/", process.env.BACKEND_URL);
      url.searchParams.set("search", query);
      url.searchParams.set("limit", "24");
      url.searchParams.set("offset", String((page - 1) * 24));
      if (topic) url.searchParams.set("topic__name__iexact", topic);
      if (subtopic) url.searchParams.set("subtopic__name__iexact", subtopic);
      const authToken = (await cookies()).get("auth_token")?.value;
      const response = await fetch(url, { cache: "no-store", headers: authToken ? { Authorization: `Token ${authToken}` } : undefined });
      unauthorized = response.status === 401;
      if (!response.ok) throw new Error("Search unavailable");
      const data = await response.json();
      if (!Array.isArray(data.results)) throw new Error("Invalid search results");
      videos = data.results;
      hasNext = Boolean(data.next);
      count = typeof data.count === "number" ? data.count : undefined;
    } catch { failed = true; }
  }

  const pageHref = (nextPage: number) => {
    const next = new URLSearchParams({ query });
    if (topic) next.set("topic", topic);
    if (subtopic) next.set("subtopic", subtopic);
    if (nextPage > 1) next.set("page", String(nextPage));
    return `/videos/search?${next}`;
  };

  return (
    <main className="min-h-[65vh] bg-stone-50 pb-16">
      <header className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <h1 className="learning-display text-5xl leading-tight tracking-tight text-stone-900 sm:text-6xl">Find a teaching.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">A question, a familiar topic, a new perspective. Start here.</p>
        <SearchForm key={`${query}:${topic}:${subtopic}`} query={query} topic={topic} subtopic={subtopic} topics={topics} />
        {query && !failed && videos.length > 0 && <p className="mt-6 break-words text-sm text-stone-600">{count !== undefined ? `${count} ${count === 1 ? "video" : "videos"}` : "Videos"} for <span className="font-medium text-stone-900">&ldquo;{query}&rdquo;</span>{(topic || subtopic) && <> in {[topic, subtopic].filter(Boolean).join(" / ")}</>}</p>}
      </header>
      {unauthorized ? <Error401 /> : failed || videos.length === 0 ? <NoResults searchParams={{ query, topic, subtopic }} failed={failed} page={page} /> : <VideoGrid videos={videos} title="Matching videos" topic_name="Results" topic={0} showAll topicVideos={false} isThereText={false} />}
      {!failed && query && (page > 1 || hasNext) && <nav aria-label="Search result pages" className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-5 px-5 pt-8">
        {page > 1 && <Link href={pageHref(page - 1)} className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 bg-white px-5 text-sm font-medium text-stone-700 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">Previous</Link>}
        <span className="text-sm tabular-nums text-stone-600">Page {page}</span>
        {hasNext && <Link href={pageHref(page + 1)} className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 bg-white px-5 text-sm font-medium text-stone-700 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">Next</Link>}
      </nav>}
    </main>
  );
}
