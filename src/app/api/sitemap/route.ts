import { NextResponse } from "next/server";
import { SitemapStream, streamToPromise } from "sitemap";

type SitemapItem = { id: number; subtopics?: { id: number }[] };

async function fetchAllItems(path: string): Promise<SitemapItem[]> {
  const items = new Map<number, SitemapItem>();
  let offset = 0;
  while (true) {
    const url = new URL(path, process.env.BACKEND_URL);
    url.searchParams.set("limit", "100");
    url.searchParams.set("offset", String(offset));
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Sitemap upstream returned ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.results)) throw new Error("Invalid sitemap results");
    const previousSize = items.size;
    for (const item of data.results) {
      if (!Number.isSafeInteger(item.id) || item.id <= 0) throw new Error("Invalid sitemap ID");
      items.set(item.id, item);
    }
    offset += data.results.length;
    if (!data.next) {
      if (typeof data.count === "number" && offset < data.count) throw new Error("Incomplete sitemap results");
      return [...items.values()];
    }
    if (items.size === previousSize) throw new Error("Sitemap pagination made no progress");
    // Reconstruct the next request against our configured backend, never its next URL.
  }
}

export async function GET() {
  try {
    const [topics, videos] = await Promise.all([
      fetchAllItems("/api/topics/"),
      fetchAllItems("/api/videos/"),
    ]);
    const paths = new Set(["/", "/topics"]);
    for (const topic of topics) {
      if (!Array.isArray(topic.subtopics)) throw new Error("Invalid sitemap subtopics");
      if (topic.subtopics.length === 0) continue;
      paths.add(`/topics/${topic.id}`);
      for (const subtopic of topic.subtopics) {
        if (!Number.isSafeInteger(subtopic.id) || subtopic.id <= 0) throw new Error("Invalid sitemap subtopic ID");
        paths.add(`/subtopics/${subtopic.id}`);
      }
    }
    for (const video of videos) paths.add(`/videos/${video.id}`);

    const stream = new SitemapStream({ hostname: "https://mytorahtoday.com" });
    const sitemap = streamToPromise(stream);
    for (const url of paths) stream.write({ url });
    stream.end();
    return new NextResponse((await sitemap).toString(), {
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=600, stale-while-revalidate",
      },
    });
  } catch {
    return new NextResponse("Unable to generate sitemap", {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
