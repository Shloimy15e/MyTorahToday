"use client";
import { notFound } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { videoData, getVideosByCategory } from "@/data/videoData";
import VideoCard from "@/components/VideoCard";
import VideoDialog from "@/components/VideoDialog";
import { categoryData } from "@/data/categoryData";
import { useState } from "react";

type Props = {
  params: {
    category: string;
  };
};

//Get the category name from the params and pass it to the getVideosByCategory function
export default function CategoryPage({ params }: Props) {
  const { category } = params;
  const Category = category.charAt(0).toUpperCase() + category.slice(1);
  console.log(Category);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const openDialog = (video: any) => {
    setSelectedVideo(video);
    setIsDialogOpen(true);
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedVideo(null);
  };

  return (
    <>
      <Header />
      {/* hero section */}
      <div className="relative w-full bg-gray-950 flex justify-center items-center">
        <Image src="/images/banner.jpg"
            alt="banner"
            width={30000}
            height={1080}
            className={"object-cover opacity-60"} />
        <div className="absolute text-white text-3xl md:text-5xl lg:text-6xl font-bold">{Category}</div>
      </div>
      <div className="bg-neutral-100 grid grid-cols-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6 justify-items-center place-items-center align-middle w-full auto-rows-max p-6">
          {getVideosByCategory(videoData, Category).length > 0 ? getVideosByCategory(videoData, Category).map((video) => (
            <VideoCard
              video={video}
              key={video.id}
              onClick={() => openDialog(video)}
            />
          )) : <p className="text-2xl col-span-full">I&apos;m sorry but I didn&apos;t get yet to this category you can check in a different time to see where I&apos;m up to.</p>}        </div>
      </div>
      <VideoDialog
        video={selectedVideo}
        isOpen={isDialogOpen}
        onClose={closeDialog}
      />
      <Footer />
    </>
  );
}
