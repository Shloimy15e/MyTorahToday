import { Metadata } from "next";
import CollectionPage from "@/components/CollectionPage";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Saved videos - My Torah Today" };

export default async function SavedVideos({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CollectionPage collection="saved" page={(await searchParams).page} />;
}
