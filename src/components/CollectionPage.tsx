import Link from "next/link";
import { cookies } from "next/headers";
import VideoGrid from "./VideoGrid";
import { Error401 } from "./Error401";
import Video from "@/types/Video";

const collections = {
  saved: {
    title: "Saved for later.",
    description: "A little space for the teachings you want to return to.",
    filter: "is_saved_by_user",
    signInTitle: "Keep a teaching close.",
    signInDescription: "Log in to save videos for later and find them here whenever you’re ready.",
    emptyTitle: "Your next teaching belongs here.",
    emptyDescription: "Use Save on any video to add it to this collection.",
    gridTitle: "Your saved videos",
  },
  liked: {
    title: "Videos you liked.",
    description: "The teachings you liked, gathered in one place.",
    filter: "is_liked_by_user",
    signInTitle: "Return to your favorites.",
    signInDescription: "Log in to see the videos you’ve liked and keep your favorite teachings together.",
    emptyTitle: "Find a teaching that speaks to you.",
    emptyDescription: "Like a video while you watch, and it will appear here.",
    gridTitle: "Your liked videos",
  },
  watched: {
    title: "Your viewing history.",
    description: "Find a familiar teaching in your viewing history.",
    filter: "is_viewed_by_user",
    signInTitle: "Pick up where you left off.",
    signInDescription: "Log in to find the videos you’ve watched and revisit a familiar teaching.",
    emptyTitle: "Your learning starts with one video.",
    emptyDescription: "The videos you watch while logged in will appear here.",
    gridTitle: "Your viewing history",
  },
};

export default async function CollectionPage({ collection, page: pageParam }: { collection: keyof typeof collections; page?: string | string[] }) {
  const copy = collections[collection];
  const authToken = (await cookies()).get("auth_token")?.value;
  if (!authToken) return <main className="min-h-[65vh] bg-stone-50"><Error401 title={copy.signInTitle} description={copy.signInDescription} /></main>;

  const requestedPage = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  let videos: Video[] = [];
  let failed = false;
  let hasNext = false;
  try {
    const url = new URL("/api/videos/", process.env.BACKEND_URL);
    url.searchParams.set(copy.filter, "true");
    url.searchParams.set("limit", "24");
    url.searchParams.set("offset", String((page - 1) * 24));
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", Authorization: `Token ${authToken}` },
      cache: "no-store",
    });
    if (response.status === 401) return <main className="min-h-[65vh] bg-stone-50"><Error401 title={copy.signInTitle} description={copy.signInDescription} /></main>;
    if (!response.ok) throw new Error("Collection unavailable");
    const data = await response.json();
    if (!Array.isArray(data.results)) throw new Error("Invalid collection");
    videos = data.results;
    hasNext = Boolean(data.next);
  } catch { failed = true; }

  const href = `/videos/${collection}`;
  return (
    <main className="min-h-[65vh] bg-stone-50 pb-16">
      <header className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 sm:pt-16 lg:px-12">
        <h1 className="learning-display text-5xl leading-tight tracking-tight text-stone-900 sm:text-6xl">{copy.title}</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">{copy.description}</p>
        <nav aria-label="Your library" className="mt-7 flex flex-wrap gap-2">
          {(["saved", "liked", "watched"] as const).map(item => <Link key={item} href={`/videos/${item}`} aria-current={item === collection ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue ${item === collection ? "bg-primary-blue text-white" : "text-stone-600 hover:bg-stone-200"}`}>{item === "saved" ? "Saved" : item === "liked" ? "Liked" : "History"}</Link>)}
        </nav>
      </header>
      {videos.length > 0 && !failed ? <VideoGrid videos={videos} title={copy.gridTitle} topic_name={copy.gridTitle} topic={0} showAll topicVideos={false} isThereText={false} /> :
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
          <h2 className="learning-display text-3xl text-stone-900 sm:text-4xl">{failed ? "Your library is taking a pause" : page > 1 ? "You’ve reached the end." : copy.emptyTitle}</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">{failed ? "We couldn’t load these videos. Please try again in a moment." : page > 1 ? "Return to the first page to revisit your collection." : copy.emptyDescription}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {(failed || page > 1) && <Link href={page > 1 ? href : `${href}?page=1`} className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">{failed ? "Try again" : "Back to the beginning"}</Link>}
            <Link href="/topics" className="inline-flex min-h-11 items-center rounded-lg bg-primary-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue">Browse topics</Link>
          </div>
        </section>}
      {!failed && (page > 1 || hasNext) && <nav aria-label="Collection pages" className="mx-auto flex max-w-7xl items-center justify-center gap-5 px-5 pt-8">
        {page > 1 && <Link href={page > 2 ? `${href}?page=${page - 1}` : href} className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 bg-white px-4 text-sm text-stone-700 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">Previous</Link>}
        <span className="text-sm tabular-nums text-stone-600">Page {page}</span>
        {hasNext && <Link href={`${href}?page=${page + 1}`} className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 bg-white px-4 text-sm text-stone-700 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">Next</Link>}
      </nav>}
    </main>
  );
}
