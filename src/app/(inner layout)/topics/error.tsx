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
  const error404 = error.message.includes("404");
  const error400 = error.message.includes("400");
  const error500 = error.message.includes("500");
  const error401 = error.message.includes("401");

  return (
    <main className="h-96 w-full flex flex-col justify-start items-center">
      <h2 className="text-2xl text-center mx-auto mt-10 w-full">
        Something went wrong!
      </h2>
      {!isProduction ? (
        <h3 className="text-xl text-center mx-auto my-4 w-full">
          {error.message}
        </h3>
      ) : error404 ? (
        <h3 className="text-xl text-center mx-auto my-4 w-full">
          404 - We&apos;re sorry, no data was found.
        </h3>
      ) : error400 ? (
        <h3 className="text-xl text-center mx-auto my-4 w-full">
          400 - Bad Request – We&apos;re sorry, the request returned undefined.
        </h3>
      ) : error401 ? (
        <h3 className="text-xl text-center mx-auto my-4 w-full">
          401 - Unauthorized – We&apos;re sorry, you need to be logged in to
          view this content. <br /> If you are logged in, please try logging out
          and logging back in.
        </h3>
      ) : error500 ? (
        <h3 className="text-xl text-center mx-auto my-4 w-full">
          500 - Internal Server Error
        </h3>
      ) : (
        <h3 className="text-xl text-center mx-auto my-4 w-full">
          We&apos;re sorry, an unknown error occurred.
        </h3>
      )}
      <p className="text-center mx-auto mt-4 w-full">
        Please reach out to me at{" "}
        <a
          href="mailto:shloimyelbaum@gmail.com"
          className="text-blue-600 hover:underline"
        >
          shloimyelbaum@gmail.com
        </a>
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
  );
}
