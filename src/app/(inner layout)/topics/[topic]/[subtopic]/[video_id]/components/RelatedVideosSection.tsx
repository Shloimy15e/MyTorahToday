import { fetchRelatedVideos } from "@/data/videoData";
import VerticalVideoGrid from "./VerticalVideoGrid";
import HorizontalVideoGrid from "./HorizontalVideoGrid";

type Props = {
  topic: string;
  subtopic: string;
  authToken: string | null;
};

export default async function RelatedVideosSection({ topic, subtopic, authToken }: Props) {
  const relatedVideos = await fetchRelatedVideos(topic, subtopic, authToken);

  return (
    <>
      {/* Video Cards Section (Vertical Part of the "L") */}
      <VerticalVideoGrid videos={relatedVideos.slice(0, 2)} />

      {/* Video Cards Section (Horizontal Part of the "L") */}
      <HorizontalVideoGrid videos={relatedVideos.slice(3)} />
    </>
  );
}