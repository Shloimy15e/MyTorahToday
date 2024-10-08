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

  const isProduction = process.env.NODE_ENV === "production";


  return (
    <div>
      <main className="h-96 w-full flex flex-col justify-start items-center">
        <h2 className="text-2xl text-center mx-auto mt-10 w-full">
          Something went wrong!
        </h2>
        {!isProduction ? (
          <h3 className="text-xl text-center mx-auto my-4 w-full">
            {error.message}
          </h3>
        ) : (
          <h3 className="text-xl text-center mx-auto my-4 w-full">
            We&apos;re sorry, an unknown error occurred.
          </h3>
        )}
        <p className="text-lg text-center text-gray-700 mb-4">
          Please excuse us while we build this special app.
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
          <a
            href="mailto:shloimyelbaum@gmail.com"
            className="bg-primary-blue hover:bg-blue-700 active:scale-90 text-white font-bold py-2 px-4 rounded"
          >
            Contact Shloimy by email
          </a>
          <Link
            href={`/topics/`}
            className="bg-primary-blue hover:bg-blue-700 active:scale-90 text-white font-bold py-2 px-4 rounded"
          >
            Return to Topics
          </Link>
        </div>
      </main>
    </div>
  );
}
