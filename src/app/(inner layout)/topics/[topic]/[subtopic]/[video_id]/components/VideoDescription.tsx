"use client";
import { useState } from "react";

export default function VideoDescription({
  description,
}: {
  description: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);



  return (
    <div className="flex flex-col gap-2 max-h-full">
      <p id="description" className={`${isExpanded ? "" : "line-clamp-3"}`}>
        {description.split(/\s+/).map((word, index) => {
          const urlPattern = /^(https?:\/\/[^\s]+)/;
          if (urlPattern.test(word)) {
            return (
              <a
                key={index}
                href={word}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {word}
              </a>
            );
          }
          return " " + word + " ";
        })}{" "}
      </p>
      {description.split(/\n/).length > 9 && (
        <button
          className="text-blue-500 hover:underline focus:outline-none"
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
