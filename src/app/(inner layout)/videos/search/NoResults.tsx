"use client";
import Link from "next/link";
import { IoArrowBack, IoHomeOutline } from "react-icons/io5";
import Head from "next/head";

export default function NoResults({ searchParams }: { searchParams: any }) {
  const query = searchParams["query"];
  const topic = searchParams["topic"] || "";
  const subtopic = searchParams["subtopic"] || "";

  return (
    <>
      <Head>
        <title>{`${"Results for"} ${query}`}</title>
      </Head>
      <main className="h-96 w-full flex flex-col justify-start items-center">
        <h1 className=" text-center font-semibold text-3xl m-10">
          No results found for &apos;{query}&apos;
          {topic && subtopic
            ? " in " + topic + " - " + subtopic
            : topic
            ? " in " + topic
            : subtopic && " in " + subtopic}
        </h1>
        <div className="text-center flex gap-6">
          <button
            onClick={() => window.history.back()}
            className="bg-primary-blue hover:bg-blue-700 active:scale-90 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
          >
            <IoArrowBack className="w-5 h-5 inline" />
            Go back to previous page
          </button>
          <Link
            href={`/`}
            className="bg-primary-blue hover:bg-blue-700 active:scale-90 text-white font-bold py-2 px-4 rounded flex gap-2 items-center justify-center"
          >
            <IoHomeOutline className="w-5 h-5 inline" />
            Return to Home
          </Link>
        </div>
      </main>
    </>
  );
}
