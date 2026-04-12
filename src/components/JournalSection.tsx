"use client";

import { Journal } from "@/types/Subtopic";
import { useState, useEffect } from "react";
import { IoDownloadOutline, IoChevronDown } from "react-icons/io5";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false });

export default function JournalSection({ journals }: { journals: Journal[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(
    journals.length === 1 ? journals[0].id : null
  );
  const [mountedId, setMountedId] = useState<number | null>(expandedId);

  useEffect(() => {
    if (expandedId !== null) {
      setMountedId(expandedId);
    } else {
      const timer = setTimeout(() => setMountedId(null), 300);
      return () => clearTimeout(timer);
    }
  }, [expandedId]);

  if (journals.length === 0) return null;

  return (
    <section className="mx-4 md:mx-8 lg:mx-16 my-10">
      {/* Section header — editorial style */}
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
          Parshah Journal
        </h2>
        {journals.length > 1 && (
          <span className="text-sm text-stone-400">{journals.length} issues</span>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {journals.map((journal) => {
          const isExpanded = expandedId === journal.id;
          const isMounted = mountedId === journal.id;

          return (
            <article
              key={journal.id}
              className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                isExpanded
                  ? "shadow-xl ring-1 ring-stone-200"
                  : "shadow-sm ring-1 ring-stone-100 hover:shadow-md hover:ring-stone-200"
              }`}
              style={{ background: isExpanded ? "#faf8f4" : "white" }}
            >
              {/* Journal header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : journal.id)}
                className="w-full flex items-center justify-between px-6 py-5 group"
              >
                <div className="flex flex-col items-start gap-0.5">
                  <span className="font-semibold text-stone-800 text-left group-hover:text-primary-blue transition-colors">
                    {journal.title}
                  </span>
                  <span className="text-xs text-stone-400">
                    {new Date(journal.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={journal.pdf}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-600 bg-stone-100 rounded-full hover:bg-primary-blue hover:text-white transition-colors"
                  >
                    <IoDownloadOutline className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </a>
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 ${
                      isExpanded ? "bg-primary-blue text-white rotate-180" : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    <IoChevronDown className="h-3.5 w-3.5" />
                  </div>
                </div>
              </button>

              {/* PDF viewer area */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-out ${
                  isExpanded ? "max-h-[90vh] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {isMounted && <PdfViewer url={journal.pdf} />}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
