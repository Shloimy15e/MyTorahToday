"use client";
import { useEffect } from "react";
// Get params from the URL
import { useParams } from "next/navigation";
import Link from "next/link";
// Get the topic name from the params

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);
  const {topic} = useParams();

  return (
    <div>
      <main className="h-96 w-full flex flex-col justify-start items-center">
        <h2 className="text-2xl text-center mx-auto my-10 w-full">
          Something went wrong!
        </h2>
        <div className="flex gap-4 justify-center items-center">
          <button
            className="bg-primary-blue hover:bg-blue-700 active:scale-90 text-white font-bold py-2 px-4 rounded"
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
          >
            Try again
          </button>
          <Link
            href={`/topics/${topic}`}
            className="bg-primary-blue hover:bg-blue-700 active:scale-90 text-white font-bold py-2 px-4 rounded"
          >
            Return to {topic}
          </Link>
        </div>
      </main>
    </div>
  );
}
