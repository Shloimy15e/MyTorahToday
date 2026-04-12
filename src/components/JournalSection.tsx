"use client";

import { Journal } from "@/types/Subtopic";
import { useState, useEffect } from "react";
import { IoDocumentTextOutline, IoDownloadOutline, IoChevronDown } from "react-icons/io5";
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
    <section className="mx-4 md:mx-8 lg:mx-16 my-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <IoDocumentTextOutline className="h-6 w-6 text-primary-blue" />
        Parshah Journal{journals.length > 1 ? "s" : ""}
      </h2>

      <div className="flex flex-col gap-4">
        {journals.map((journal) => {
          const isExpanded = expandedId === journal.id;
          const isMounted = mountedId === journal.id;

          return (
            <div
              key={journal.id}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-card"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : journal.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-800">{journal.title}</span>
                <div className="flex items-center gap-3">
                  <a
                    href={journal.pdf}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-blue border border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white"
                  >
                    <IoDownloadOutline className="h-4 w-4" />
                    Download
                  </a>
                  <IoChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  isExpanded
                    ? "max-h-[85vh] opacity-100 border-t border-gray-200"
                    : "max-h-0 opacity-0"
                }`}
              >
                {isMounted && <PdfViewer url={journal.pdf} />}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
