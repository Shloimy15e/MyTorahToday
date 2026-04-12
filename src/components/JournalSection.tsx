"use client";

import { Journal } from "@/types/Subtopic";
import { useState } from "react";
import { IoDocumentTextOutline, IoDownloadOutline, IoChevronDown, IoChevronUp } from "react-icons/io5";

export default function JournalSection({ journals }: { journals: Journal[] }) {
  const [expandedId, setExpandedId] = useState<number | null>(
    journals.length === 1 ? journals[0].id : null
  );

  if (journals.length === 0) return null;

  return (
    <section className="mx-4 md:mx-8 lg:mx-16 my-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <IoDocumentTextOutline className="h-6 w-6 text-primary-blue" />
        Parshah Journal{journals.length > 1 ? "s" : ""}
      </h2>

      <div className="flex flex-col gap-4">
        {journals.map((journal) => (
          <div
            key={journal.id}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
          >
            {/* Header — clickable to expand/collapse */}
            <button
              onClick={() =>
                setExpandedId(expandedId === journal.id ? null : journal.id)
              }
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-800">{journal.title}</span>
              <div className="flex items-center gap-3">
                <a
                  href={journal.pdf}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-blue border border-primary-blue rounded-lg hover:bg-primary-blue hover:text-white transition-colors"
                >
                  <IoDownloadOutline className="h-4 w-4" />
                  Download
                </a>
                {expandedId === journal.id ? (
                  <IoChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <IoChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Embedded PDF viewer */}
            {expandedId === journal.id && (
              <div className="border-t border-gray-200">
                <iframe
                  src={`${journal.pdf}#toolbar=1&navpanes=0`}
                  className="w-full h-[80vh] min-h-[600px]"
                  title={journal.title}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
