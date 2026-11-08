"use client";

import { useId, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function VideoDescription({ description }: { description: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const id = useId();
  const canExpand = description.length > 240 || description.split("\n").length > 3;

  return <div className="max-w-prose text-sm leading-7 text-stone-600">
    <p id={id} className={`whitespace-pre-line break-words ${canExpand && !isExpanded ? "line-clamp-4" : ""}`}>
      {description.split(/(https?:\/\/[^\s]+)/g).map((part, index) => /^https?:\/\//.test(part) ? <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-primary-blue underline decoration-blue-200 underline-offset-4 hover:decoration-primary-blue">{part}</a> : part)}
    </p>
    {canExpand && <button type="button" aria-expanded={isExpanded} aria-controls={id} onClick={() => setIsExpanded(!isExpanded)} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary-blue hover:underline underline-offset-4">{isExpanded ? "Show less" : "Read full description"}<ChevronDownIcon aria-hidden="true" className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`} /></button>}
  </div>;
}
