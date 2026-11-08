"use client";

import { Journal } from "@/types/Subtopic";
import { useState } from "react";
import { ArrowDownTrayIcon, ChevronDownIcon, ArrowUpRightIcon } from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";

const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
  loading: () => <p className="p-8 text-sm text-stone-600" role="status">Opening journal…</p>,
});

function JournalPreview({ journal, reducedMotion }: { journal: Journal; reducedMotion: boolean }) {
  const isPresent = useIsPresent();

  return (
    <motion.div
      id={`journal-${journal.id}`}
      role="region"
      aria-label={`${journal.title} preview`}
      aria-hidden={!isPresent}
      ref={(node) => { node?.toggleAttribute("inert", !isPresent); }}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: reducedMotion ? 0 : isPresent ? 0.32 : 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden"
    >
      <div className="border-t border-stone-200">
        <PdfViewer url={journal.pdf} title={journal.title} />
      </div>
    </motion.div>
  );
}

export default function JournalSection({ journals }: { journals: Journal[] }) {
  const reducedMotion = useReducedMotion();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState("");

  async function downloadJournal(journal: Journal) {
    setDownloadingId(journal.id);
    setDownloadError(null);
    setDownloadStatus(`Preparing ${journal.title} for download…`);
    try {
      const response = await fetch(journal.pdf);
      if (!response.ok) throw new Error("Download failed");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = new URL(journal.pdf, window.location.href).pathname.split("/").pop() || "journal.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadStatus(`The PDF download for ${journal.title} has started.`);
    } catch {
      setDownloadError("The download could not start. Use Open PDF to open and save the journal.");
      setDownloadStatus("");
    } finally {
      setDownloadingId(null);
    }
  }
  if (!journals.length) return null;
  return (
    <section id="journal" aria-labelledby="journal-heading" className="scroll-mt-28 pt-4">
      <h2 id="journal-heading" className="learning-display text-3xl tracking-tight text-stone-900 sm:text-4xl">Journal</h2>
      <p className="mb-6 mt-3 text-stone-600">Read here, or open the PDF for printing and offline reading.</p>
      {downloadError && <p role="alert" className="mb-4 text-sm text-red-800">{downloadError}</p>}
      <p role="status" className={downloadStatus ? "mb-4 text-sm text-stone-600" : "sr-only"}>{downloadStatus}</p>
      <div className="space-y-4">
        {journals.map((journal) => {
          const isExpanded = expandedId === journal.id;
          return (
            <article key={journal.id} className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-200 motion-reduce:transition-none ${isExpanded ? "border-primary-blue/40" : "border-stone-200"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                <button type="button" aria-expanded={isExpanded} aria-controls={`journal-${journal.id}`} onClick={() => setExpandedId(isExpanded ? null : journal.id)} className="group inline-flex min-h-14 flex-1 items-center gap-4 rounded-xl px-2 py-2 text-left font-semibold text-stone-900 transition-colors duration-200 hover:bg-blue-50 hover:text-primary-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 motion-reduce:transition-none">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-200 motion-reduce:transition-none ${isExpanded ? "bg-primary-blue text-white" : "bg-blue-50 text-primary-blue group-hover:bg-blue-100"}`}><ChevronDownIcon className={`h-5 w-5 transition-transform duration-300 motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""}`} aria-hidden="true" /></span>
                  <span>{journal.title}<span className="mt-1 block text-sm font-normal text-stone-600">{isExpanded ? "Close preview" : "Preview journal"}</span></span>
                </button>
                <div className="flex w-full flex-wrap items-center gap-2 border-t border-stone-100 pt-3 sm:w-auto sm:border-0 sm:pt-0">
                  <a href={journal.pdf} target="_blank" rel="noopener noreferrer" className="group inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-primary-blue transition-colors duration-200 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 motion-reduce:transition-none">Open PDF <ArrowUpRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" aria-hidden="true" /><span className="sr-only">for {journal.title} (opens in a new tab)</span></a>
                  <button type="button" onClick={() => downloadJournal(journal)} disabled={downloadingId !== null} aria-busy={downloadingId === journal.id} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors duration-200 hover:bg-stone-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-blue focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 motion-reduce:transition-none"><ArrowDownTrayIcon className="h-4 w-4" aria-hidden="true" />{downloadingId === journal.id ? "Preparing PDF…" : "Save PDF"}<span className="sr-only"> for {journal.title}</span></button>
                </div>
              </div>
              <AnimatePresence initial={false}>
                {isExpanded && <JournalPreview key={journal.id} journal={journal} reducedMotion={Boolean(reducedMotion)} />}
              </AnimatePresence>
            </article>
          );
        })}
      </div>
    </section>
  );
}
