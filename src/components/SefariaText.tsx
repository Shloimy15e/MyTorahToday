"use client";
import { useState, useRef } from "react";
import { ChevronDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import DOMPurify from "dompurify";

export default function SefariaText({
  text,
  title,
}: {
  text: string[];
  title: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const purify = typeof window !== "undefined" ? DOMPurify(window) : null;
  const sanitizedTextArray = text.map((item) =>
    purify ? purify.sanitize(item) : item
  );

  const hasMoreText = sanitizedTextArray.length > 1;

  const toggleExpanded = () => {
    if (expanded) {
      setExpanded(false);
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } else {
      setExpanded(true);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-gradient-to-b from-stone-50 to-white rounded-2xl text-right shadow-md border border-stone-200 p-5 sm:p-6 md:p-10 mx-3 sm:mx-4 my-6 md:mx-8 md:my-8 max-w-4xl lg:mx-auto transition-all duration-500"
      id="sefaria-text-component"
    >
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-primary-blue border-b-2 border-primary-blue/20 pb-3">
        {title}
      </h2>

      <div className="text-stone-800 text-lg sm:text-xl md:text-2xl leading-[1.9] sm:leading-[2] md:leading-[2.2] tracking-wide">
        <div
          dangerouslySetInnerHTML={{ __html: sanitizedTextArray[0] }}
        />

        {hasMoreText && (
          <div
            className={`grid transition-all duration-500 ease-in-out ${
              expanded ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              {sanitizedTextArray.slice(1).map((html, i) => (
                <div
                  key={i}
                  className="mt-4"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {hasMoreText && (
        <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 md:mt-8 pt-5 md:pt-6 border-t border-stone-200 font-sans text-sm sm:text-base">
          <button
            onClick={toggleExpanded}
            className="inline-flex items-center gap-2 bg-primary-blue text-white font-medium px-5 sm:px-6 py-3 rounded-full shadow-sm hover:shadow-md hover:bg-blue-900 active:scale-95 transition-all duration-200 cursor-pointer min-h-[44px]"
          >
            <ChevronDownIcon
              strokeWidth={2.5}
              className={`w-5 h-5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            />
            {expanded ? "Show Less" : `Continue Reading (${sanitizedTextArray.length - 1} more)`}
          </button>

          {expanded && (
            <button
              onClick={() => containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="inline-flex items-center gap-1.5 text-stone-500 hover:text-primary-blue active:text-primary-blue font-medium px-4 py-3 rounded-full transition-colors duration-200 cursor-pointer min-h-[44px] min-w-[44px] justify-center"
              title="Back to top"
            >
              <ArrowUpIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Top</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
