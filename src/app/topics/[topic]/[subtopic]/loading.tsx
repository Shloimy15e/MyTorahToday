import React from "react";
import LoadingVideoCardAnimation
 from "@/components/LoadingVideoCardAnimation";
export default function Loading() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(5)].map((_, index) => (
        <LoadingVideoCardAnimation key={index} />
      ))}
    </div>
  );
}
