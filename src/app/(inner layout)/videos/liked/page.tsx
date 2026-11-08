import { Metadata } from "next";
import CollectionPage from "@/components/CollectionPage";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Liked videos - My Torah Today" };

export default async function LikedVideos({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <CollectionPage collection="liked" page={(await searchParams).page} />;
}
