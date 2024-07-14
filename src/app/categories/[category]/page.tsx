"use client";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  videoData,
  getVideosByCategory,
  getVideosBySubcategory,
} from "@/data/videoData";
import VideoCard from "@/components/VideoCard";
import VideoDialog from "@/components/VideoDialog";
import { subcategoryData } from "@/data/subcategoryData";
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
  const displayCategory = Category.replace("-", " ");
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

  const videosInCategory = getVideosByCategory(videoData, Category);

  return (
    <>
      <Header />
      {/* hero section */}
      <div className="relative w-full bg-gray-950 flex justify-center items-center">
        <Image
          src="/images/banner.jpg"
          alt="banner"
          width={30000}
          height={1080}
          className={"object-cover opacity-60"}
        />
        <h1 className="absolute text-white text-3xl md:text-5xl lg:text-6xl font-bold">
          {displayCategory}
        </h1>
      </div>
      <div className="bg-neutral-100 grid grid-cols-1 justify-items-center">
        {videosInCategory.length > 0 ? (
          // Get all videos in category divided in subcategories
          subcategoryData.map((subcategory) =>
            getVideosBySubcategory(videosInCategory, subcategory.name)
              .length === 0 ? null : (
              <div key={subcategory.id}>
                <h1 className="text-4xl font-bold my-6 ml-6">
                  {subcategory.name}
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6 justify-items-center place-items-center align-middle w-full auto-rows-max p-6">
                  {getVideosBySubcategory(
                    videosInCategory,
                    subcategory.name
                  ).map((video) => (
                    <VideoCard
                      video={video}
                      key={video.id}
                      onClick={() => openDialog(video)}
                    />
                  ))}
                </div>
              </div>
            )
          )
        ) : (
          <div className="p-6 w-3/5 text-center">
            <h1 className="text-3xl font-semibold text-gray-800">
              No videos are in category &quot;{displayCategory}&quot;{" "}
            </h1>
            <p className="text-2xl text-gray-600">
              I&apos;m sorry but I didn&apos;t get yet to this category you can
              check in a different time to see where I&apos;m up to.
            </p>
          </div>
        )}
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
