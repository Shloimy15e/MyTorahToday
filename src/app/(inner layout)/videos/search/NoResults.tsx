import Link from "next/link";

export default function NoResults({ searchParams, failed = false, page = 1 }: { searchParams: { query?: string; topic?: string; subtopic?: string }; failed?: boolean; page?: number }) {
  const { query = "", topic = "", subtopic = "" } = searchParams;
  const filterLabel = [topic, subtopic].filter(Boolean).join(" / ");
  const retryParams = new URLSearchParams({ query });
  if (topic) retryParams.set("topic", topic);
  if (subtopic) retryParams.set("subtopic", subtopic);

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
      <h2 className="learning-display text-3xl text-stone-900 sm:text-4xl">{failed ? "Search is taking a pause" : query && page > 1 ? "You’ve reached the end." : query ? "No matching videos yet" : "What would you like to learn?"}</h2>
      <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
        {failed ? "We couldn’t load these results. Please try your search again." : query && page > 1 ? "There are no videos on this page. Return to the first page to explore your results." : query ? <>We couldn’t find videos for &ldquo;{query}&rdquo;{filterLabel && <> in {filterLabel}</>}. Try a shorter phrase{filterLabel ? " or search across all topics" : " or a different keyword"}.</> : "Enter a word or phrase above, or explore the library by topic."}
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        {failed ? <Link href={`/videos/search?${retryParams}`} className="inline-flex min-h-11 items-center rounded-lg bg-primary-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue">Try again</Link>
          : query && page > 1 ? <Link href={`/videos/search?${retryParams}`} className="inline-flex min-h-11 items-center rounded-lg bg-primary-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue">Back to the first page</Link>
          : query && filterLabel ? <Link href={`/videos/search?${new URLSearchParams({ query })}`} className="inline-flex min-h-11 items-center rounded-lg bg-primary-blue px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue">Search all topics</Link> : null}
        <Link href="/topics" className="inline-flex min-h-11 items-center rounded-lg border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">Browse topics</Link>
      </div>
    </section>
  );
}
