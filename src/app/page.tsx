import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Main from "@/components/Main";
import Footer from "@/components/Footer";
import Video from "@/types/Video";

async function getParshahThisWeek() {
  try {
    const response = await fetch(
      "https://api.ginzburg.io/zmanim/shabbat?cl_offset=18&lat=32.09&lng=34.86&elevation=0&havdala=tzeis_8_5_degrees",
      {
        // next: { revalidate: 3600 } // Revalidate every hour
      }
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}` + JSON.stringify(data));
    }
    return data.torah_part;
  } catch (error) {
    console.error("Error fetching parshah this week: ", error);
    throw error; // Re-throw to handle in component
  }
}
const getVideosBySubtopicName = async (subtopic: string): Promise<Video[]> => {
  const limit = 6;
  const response = await fetch(
    `https://mttbackend-production.up.railway.app/api/videos/?limit=${limit}&subtopic__name__iexact=${subtopic}`
  );
  const data = await response.json();
  return data.results;
};

export default async function Home() {
  try {
    const parshahThisWeek = await getParshahThisWeek();
    const videosThisParshah = await getVideosBySubtopicName(parshahThisWeek);
    if (!videosThisParshah) {
      throw new Error("No videos found for this parshah", videosThisParshah);
    }
    return (
      <>
        <Header />
        <Main parshahThisWeek={parshahThisWeek} videosThisParshah={videosThisParshah} />
        <Footer />
      </>
    );
  } catch (error) {
    // Handle errors gracefully
    console.error("Error fetching data:", error);
    return notFound(); // Or display an error component
  }
}
