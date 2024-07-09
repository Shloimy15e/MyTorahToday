import Header from "../components/header";
import Footer from "../components/footer";
import { videoData } from "@/data/videoData";
import VideoEmbed from "@/components/VideoEmbed";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gray-50">
        <div className="w-full h-fit">
          <h1 className="text-4xl font-bold text-center my-4 mx-auto rounded-full bg-gray-100 w-96 h-16">
            First video
          </h1>
          {/* list of all videos */}
          <ul className="grid grid-cols-2 items-center w-full">
            {videoData.map((video) => (
              <li
                key={video.id}
                className="flex flex-col items-center justify-center w-full"
              >
                <VideoEmbed
                  src={video.embedUrl}
                  title={video.title}
                  className=" w-full h-full"
                />
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
