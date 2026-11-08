"use client";
import { Fragment, useState, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { ArrowTopRightOnSquareIcon, ArrowUpIcon, ArrowDownIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import DOMPurify from "dompurify";
import type { SourceTextSection } from "@/data/sourceText";
import { findSourceMatches, nextSourceMatch } from "@/utils/sourceSearch";

type Props = {
  text: string[]; title: string; sourceUrl?: string; sections?: SourceTextSection[];
  direction?: "rtl" | "ltr"; language?: string; readerClassName?: string;
};

export default function SefariaText({ text, title, sourceUrl, sections, direction, language, readerClassName = "" }: Props) {
  const [mounted, setMounted] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const passageNodes = useRef(new Map<string, HTMLDivElement>());
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => setMounted(true), []);
  const groups = useMemo(() => {
    let remaining = readerOpen ? Infinity : 3;
    return (sections?.length ? sections : [{ ref: "", text }]).map((group, groupIndex) => {
      const visible = group.text.slice(0, remaining);
      remaining -= visible.length;
      return {
        ref: group.ref,
        passages: visible.map((raw, index) => {
          const html = mounted ? DOMPurify.sanitize(raw) : "";
          const plain = mounted ? new DOMParser().parseFromString(html, "text/html").body.textContent || "" : "";
          return { key: `${groupIndex}-${index}`, html, text: plain, reference: group.references?.[index] || group.ref, segmentReference: group.references?.[index] };
        }),
      };
    });
  }, [mounted, sections, text, readerOpen]);
  const matches = useMemo(() => findSourceMatches(groups.flatMap(group => group.passages), query), [groups, query]);
  const activeIndex = Math.min(matchIndex, Math.max(0, matches.length - 1));
  const currentMatch = matches[activeIndex];
  useEffect(() => {
    if (readerOpen && currentMatch) {
      passageNodes.current.get(currentMatch)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
    }
  }, [readerOpen, currentMatch]);
  const readingFont = { fontFamily: "var(--font-source-reading), serif" };
  const titleFont = direction === "ltr" ? { fontFamily: "var(--font-learning-display), serif" } : readingFont;
  const sourceLink = sourceUrl && <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary-blue underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">Open in Sefaria<ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>;
  function moveMatch(step: number) { setMatchIndex(nextSourceMatch(activeIndex, matches.length, step)); }
  const matchButton = "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-white hover:text-primary-blue disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue";

  return <>
    <article className="mx-auto w-full max-w-4xl rounded-2xl bg-white px-5 py-7 sm:px-10 sm:py-9 lg:px-14 lg:py-10" id="sefaria-text-component">
      <header className="mb-6">
        <h3 dir={direction || "auto"} lang={language} className="text-start text-2xl font-medium leading-relaxed text-primary-blue sm:text-3xl" style={titleFont}>{title}</h3>
        <p className="mt-2 text-sm text-stone-500">Source: Sefaria</p>
      </header>
      <div dir={direction || "auto"} lang={language} className="space-y-3 text-start text-[20px] leading-[1.95] text-stone-800 sm:text-[23px] [&_a]:text-primary-blue [&_a]:underline" style={readingFont}>
        {groups.flatMap(group => group.passages).slice(0, 3).map(passage => <div key={passage.key} dangerouslySetInnerHTML={{ __html: passage.html }} />)}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button type="button" onClick={() => setReaderOpen(true)} aria-haspopup="dialog" className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary-blue px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue motion-reduce:transition-none">Read full text</button>
        {sourceLink}
      </div>
    </article>
    <Transition show={readerOpen} as={Fragment}>
      <Dialog onClose={setReaderOpen} className={`${readerClassName} relative z-[60]`} onKeyDown={event => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") { event.preventDefault(); searchInput.current?.focus(); }
      }}>
        <TransitionChild as={Fragment} enter="transition-opacity duration-200 motion-reduce:transition-none" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity duration-150 motion-reduce:transition-none" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-stone-950/40" aria-hidden="true" /></TransitionChild>
        <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-6">
          <TransitionChild as={Fragment} enter="transition duration-300 ease-out motion-reduce:transition-none" enterFrom="translate-y-4 opacity-0 motion-reduce:translate-y-0" enterTo="translate-y-0 opacity-100" leave="transition duration-150 ease-in motion-reduce:transition-none" leaveFrom="translate-y-0 opacity-100" leaveTo="translate-y-4 opacity-0 motion-reduce:translate-y-0">
            <DialogPanel className="flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-[#fffefa] text-stone-800 shadow-xl sm:max-h-[calc(100dvh-3rem)]">
              <header className="flex shrink-0 items-start justify-between gap-4 px-5 pb-2 pt-5 sm:px-8 sm:pt-6">
                <div className="min-w-0">
                  <DialogTitle dir={direction || "auto"} lang={language} className="text-start text-2xl font-medium leading-relaxed text-primary-blue sm:text-3xl" style={titleFont}>{title}</DialogTitle>
                  <div className="flex flex-wrap items-center gap-x-4 text-sm text-stone-500"><span>Sefaria</span>{sourceLink}</div>
                </div>
                <button type="button" onClick={() => setReaderOpen(false)} aria-label="Close source reader" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-primary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue"><XMarkIcon className="h-6 w-6" aria-hidden="true" /></button>
              </header>
              <div className="shrink-0 px-4 pb-4 sm:px-8">
                <div className="flex flex-wrap items-center gap-1 rounded-xl bg-stone-100 p-1">
                  <div className="flex min-w-32 flex-1 items-center gap-2 px-2">
                    <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-stone-500" aria-hidden="true" />
                    <input ref={searchInput} data-autofocus aria-label="Search source text" value={query} onChange={event => { setQuery(event.target.value); setMatchIndex(0); }} onKeyDown={event => {
                      if (["Enter", "ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); moveMatch(event.key === "ArrowUp" || (event.key === "Enter" && event.shiftKey) ? -1 : 1); }
                    }} placeholder="Find a word or reference…" dir="auto" className="min-h-11 w-full min-w-0 bg-transparent text-sm placeholder:text-stone-500 focus:outline-none" />
                  </div>
                  {query && <button type="button" aria-label="Clear source search" onClick={() => { setQuery(""); setMatchIndex(0); searchInput.current?.focus(); }} className={matchButton}><XMarkIcon className="h-4 w-4" aria-hidden="true" /></button>}
                  <span role="status" aria-live="polite" className="min-w-14 px-1 text-center text-xs tabular-nums text-stone-600">{query.trim() ? matches.length ? `${activeIndex + 1} of ${matches.length}` : "No matches" : ""}</span>
                  <button type="button" aria-label="Previous match" disabled={!matches.length} onClick={() => moveMatch(-1)} className={matchButton}><ArrowUpIcon className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" aria-label="Next match" disabled={!matches.length} onClick={() => moveMatch(1)} className={matchButton}><ArrowDownIcon className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              </div>
              <div dir={direction || "auto"} lang={language} className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-10 pt-2 text-start text-[21px] leading-[2] sm:px-10 sm:pb-12 sm:text-[25px] lg:px-14" style={readingFont}>
                {readerOpen && groups.map((group, groupIndex) => <section key={groupIndex} className={groupIndex ? "mt-10 sm:mt-12" : ""}>
                  {group.ref && <h4 dir="auto" className="mb-5 font-sans text-sm font-medium leading-relaxed text-stone-500">{group.ref}</h4>}
                  <div className="space-y-3 [&_a]:text-primary-blue [&_a]:underline [&_a]:underline-offset-4 [&_small]:text-[0.75em]">
                    {group.passages.map(passage => <div key={passage.key} ref={node => { if (node) passageNodes.current.set(passage.key, node); else passageNodes.current.delete(passage.key); }} className={`scroll-mt-8 flex gap-4 rounded-lg px-2 py-1 transition-colors duration-300 ${currentMatch === passage.key ? "bg-blue-100 text-blue-950" : matches.includes(passage.key) ? "bg-amber-50" : ""}`}>
                      {passage.segmentReference && <span dir="ltr" title={passage.segmentReference} className="min-w-5 pt-2 font-sans text-xs tabular-nums text-stone-500">{passage.segmentReference.split(":").pop()}</span>}
                      <div className="min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: passage.html }} />
                    </div>)}
                  </div>
                </section>)}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  </>;
}
