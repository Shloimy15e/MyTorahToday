import React from "react";
import LoadingVideoCardAnimation from "@/components/LoadingVideoCardAnimation";
export default function Loading() {
  return (
    <main className="grid grid-cols-1 md:grid-cols-12 gap-8 2xl:gap-10 p-4 video-page-container w-full 2xl:max-w-screen-2xl mx-auto">
        <div className="md:col-span-12 lg:col-span-9 row-span-2">
            <LoadingVideoCardAnimation />
        </div>
        <div className="md:col-span-12 lg:col-span-3 grid md:grid-cols-2 lg:grid-cols-1 gap-4 2xl:gap-8">
            {[...Array(2)].map((_, index) => (
                <LoadingVideoCardAnimation key={index} />
            ))}
        </div>
        <div className="md:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-8">
            {[...Array(8)].map((_, index) => (
                <LoadingVideoCardAnimation key={index} />
            ))}
        </div>
    </main>
  );
}
