import HorizontalVideoGrid from "./HorizontalVideoGrid";
import VerticalVideoGrid from "./VerticalVideoGrid";
import { fetchRelatedVideosServer } from "@/data/videoData";

type Props = {
  videoId: number;
  topic: string;
  subtopic: string;
  authToken: string | null;
};

export default async function RelatedVideosSection({ videoId, topic, subtopic, authToken }: Props) {
  const relatedVideos = await fetchRelatedVideosServer( videoId, [topic], [subtopic], authToken);

  return (
    <>
      {/* Video Cards Section (Vertical Part of the "L") */}
      <VerticalVideoGrid videos={relatedVideos.slice(0, 2)} />

      {/* Video Cards Section (Horizontal Part of the "L") */}
      <HorizontalVideoGrid videos={relatedVideos.slice(3)} />
    </>
  );
}