"use client";
import { useEffect } from "react";
import Link from "next/link";

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

  return (
    <div>
      <main className="h-96 w-full flex flex-col justify-start items-center">
        <h2 className="text-2xl text-center mx-auto mt-10 w-full">
          Something went wrong!
        </h2>
        <h3 className="text-xl text-center mx-auto my-4 w-full">
            {error.message}
        </h3>
        <p className="text-center mx-auto mt-4 w-full">
            Unfortunately we couldn&apos;t retrieve any data.
        </p>
        <p className="text-center mx-auto mt-4 w-full">
            Please reach out to me at <a href="mailto:shloimyelbaum@gmail.com" className="text-blue-600 hover:underline">shloimyelbaum@gmail.com</a>
        </p>
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
            href={`/`}
            className="bg-primary-blue hover:bg-blue-700 active:scale-90 text-white font-bold py-2 px-4 rounded"
          >
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
