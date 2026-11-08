import { Metadata } from "next";
import CollectionPage from "@/components/CollectionPage";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Viewing history - My Torah Today" };

export default async function WatchedVideos({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CollectionPage collection="watched" page={(await searchParams).page} />;
}
