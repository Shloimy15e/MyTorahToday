import VideoGrid from "@/components/VideoGrid";
import Head from "next/head";

export default async function Search({ searchParams }: { searchParams: any }) {
  const query = searchParams["query"];
  const topic = searchParams["topic"] || "";
  const subtopic = searchParams["subtopic"] || "";
  const url = `${process.env.BACKEND_URL}/api/videos/?search=${query}&topic__name__iexact=${topic}&subtopic__name__iexact=${subtopic}`;
  console.log(url);

  const res = await fetch(
    url
  );
  const data = await res.json();
  const videos = data.results;
  return (
    <>
      <Head>
        <title>{`${"Results for"} ${query}`}</title>
        <meta name="description" content={`Results for ${query}`} />
      </Head>
      <main>
        {videos && videos.length > 0 && (
          <VideoGrid
            videos={videos}
            title={`${"Results for"} ${query}`}
            topicName={"Results for"}
            showAll={true}
            topicVideos={false}
            isThereText={false}
          />
        )}
      </main>
    </>
  );
}
