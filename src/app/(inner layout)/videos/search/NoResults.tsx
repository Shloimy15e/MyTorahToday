"use client";

import Link from "next/link";
import { IoArrowBack, IoHomeOutline, IoSearchOutline } from "react-icons/io5";

export default function NoResults({ searchParams }: { searchParams: any }) {
  const query = searchParams["query"] || "";
  const topic = searchParams["topic"] || "";
  const subtopic = searchParams["subtopic"] || "";

  const filterLabel = topic && subtopic
    ? `${topic} \u203a ${subtopic}`
    : topic || subtopic || "";

  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <IoSearchOutline className="w-7 h-7 text-gray-400" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">
            No results found
          </h1>
          <p className="text-gray-500">
            {query ? (
              <>
                We couldn&apos;t find any videos matching &ldquo;{query}&rdquo;
                {filterLabel && <> in {filterLabel}</>}.
              </>
            ) : (
              <>Enter a search term to find videos.</>
            )}
          </p>
        </div>

        {query && (
          <p className="text-sm text-gray-400">
            Try different keywords or remove the topic filter.
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <IoArrowBack className="w-4 h-4" />
            Go back
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary-blue rounded-lg hover:bg-blue-800 active:bg-blue-900 transition-colors"
          >
            <IoHomeOutline className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
