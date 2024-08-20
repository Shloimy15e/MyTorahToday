import React from "react";
import LoadingVideoCardAnimation from "@/components/LoadingVideoCardAnimation";
export default function Loading() {
  return (
    <section>
      <div>
        <h1 className="h-8 w-24 bg-gray-400 rounded-full animate-pulse pb-4 relative  my-6 ml-10"></h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
        {[...Array(5)].map((_, index) => (
          <LoadingVideoCardAnimation key={index} />
        ))}
      </div>
    </section>
  );
}
