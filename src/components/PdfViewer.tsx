"use client";

import { Component, useState, useEffect, useRef, type ReactNode, type KeyboardEvent } from "react";
import { Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { ArrowsPointingOutIcon, ArrowsPointingInIcon, ChevronLeftIcon, ChevronRightIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function PreviewError() {
  return <p role="status" className="p-8 text-center text-sm leading-relaxed text-stone-600">The preview is unavailable. Use Open PDF or Save PDF above to read the journal.</p>;
}

class PreviewBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <PreviewError /> : this.props.children; }
}

export default function PdfViewer({ url, title = "Journal" }: { url: string; title?: string }) {
  return <PreviewBoundary key={url}><JournalReader url={url} title={title} /></PreviewBoundary>;
}

function JournalReader({ url, title }: { url: string; title: string }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [failed, setFailed] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const readingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    // Own the loader so StrictMode cleanup cannot publish a destroyed PDF proxy.
    const task = pdfjs.getDocument(url);
    task.promise.then(document => {
      if (active) setPdf(document);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => {
      active = false;
      void task.destroy().catch(() => {});
    };
  }, [url]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    let resizeTimer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(([entry]) => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => setContainerWidth(Math.round(entry.contentRect.width)), 120);
    });
    observer.observe(node);
    return () => {
      clearTimeout(resizeTimer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setCanFullscreen(Boolean(document.fullscreenEnabled && containerRef.current?.requestFullscreen));
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
      setFullscreenError("");
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function changePage(next: number) {
    if (!pdf) return;
    setPageNumber(Math.max(1, Math.min(pdf.numPages, next)));
    readingRef.current?.scrollTo({ top: 0, left: 0 });
  }

  function onReaderKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!pdf || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, [contenteditable='true'], [role='slider']")) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      changePage(pageNumber + (event.key === "ArrowRight" ? 1 : -1));
    }
  }

  async function toggleFullscreen() {
    setFullscreenError("");
    try {
      if (document.fullscreenElement === containerRef.current) await document.exitFullscreen();
      else await containerRef.current?.requestFullscreen();
      readingRef.current?.focus({ preventScroll: true });
    } catch {
      setFullscreenError("Full screen could not open. You can keep reading here.");
    }
  }

  const buttonClass = "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded text-stone-700 transition-colors hover:bg-stone-200 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue";
  const pageWidth = Math.max(1, Math.min(containerWidth - 48, 850));
  return (
    <div ref={containerRef} onKeyDown={onReaderKeyDown} className={`flex flex-col overflow-hidden bg-stone-100 ${isFullscreen ? "h-[100dvh] w-full" : ""}`}>
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b border-stone-200 bg-white px-3 py-1.5 sm:px-4">
        <h3 className="min-w-0 flex-1 basis-full truncate py-1 text-sm font-medium text-stone-700 sm:basis-auto" title={title}>{title}</h3>
        {pdf && !failed && <>
          <div className="flex items-center" role="group" aria-label="Journal pages">
            <button type="button" className={buttonClass} disabled={pageNumber <= 1} onClick={() => changePage(pageNumber - 1)} aria-label="Previous page"><ChevronLeftIcon className="h-4 w-4" aria-hidden="true" /></button>
            <span aria-live="polite" aria-atomic="true" className="min-w-14 text-center text-xs tabular-nums text-stone-600"><span className="sr-only">Page {pageNumber} of {pdf.numPages}</span><span aria-hidden="true">{pageNumber} / {pdf.numPages}</span></span>
            <button type="button" className={buttonClass} disabled={pageNumber >= pdf.numPages} onClick={() => changePage(pageNumber + 1)} aria-label="Next page"><ChevronRightIcon className="h-4 w-4" aria-hidden="true" /></button>
          </div>
          <div className="flex items-center" role="group" aria-label="Journal zoom">
            <button type="button" className={buttonClass} disabled={scale <= 0.5} onClick={() => setScale(value => Math.max(0.5, value - 0.25))} aria-label="Zoom out"><MinusIcon className="h-4 w-4" aria-hidden="true" /></button>
            <span className="min-w-10 text-center text-xs tabular-nums text-stone-600" aria-live="polite">{Math.round(scale * 100)}%</span>
            <button type="button" className={buttonClass} disabled={scale >= 2.5} onClick={() => setScale(value => Math.min(2.5, value + 0.25))} aria-label="Zoom in"><PlusIcon className="h-4 w-4" aria-hidden="true" /></button>
            <button type="button" onClick={() => setScale(1)} aria-label="Fit journal to width" className="min-h-11 rounded px-2 text-xs text-stone-600 transition-colors hover:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue">Fit width</button>
          </div>
        </>}
        {canFullscreen && <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit full screen" : "Read journal full screen"} title={isFullscreen ? "Exit full screen" : "Full screen"} aria-pressed={isFullscreen} className={buttonClass}>
          {isFullscreen ? <ArrowsPointingInIcon className="h-4 w-4" aria-hidden="true" /> : <ArrowsPointingOutIcon className="h-4 w-4" aria-hidden="true" />}
        </button>}
      </div>
      {fullscreenError && <p role="status" className="bg-white px-4 py-2 text-sm text-stone-600">{fullscreenError}</p>}
      {failed ? <PreviewError /> : <div ref={readingRef} className={`overflow-auto p-4 outline-offset-[-3px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue sm:p-6 ${isFullscreen ? "min-h-0 flex-1" : "max-h-[75vh] min-h-72"}`} role="region" aria-label={`${title} page preview. Use left and right arrow keys to turn pages.`} tabIndex={0}>
        {pdf && containerWidth > 0 ? (
          <JournalPage key={pageNumber} pdf={pdf} pageNumber={pageNumber} width={pageWidth} scale={scale} onError={() => setFailed(true)} />
        ) : <p role="status" className="py-24 text-center text-sm text-stone-600">Opening journal…</p>}
      </div>}
    </div>
  );
}

function JournalPage({ pdf, pageNumber, width, scale, onError }: {
  pdf: PDFDocumentProxy; pageNumber: number; width: number; scale: number; onError: () => void;
}) {
  const [aspectRatio, setAspectRatio] = useState(1.414);
  const [rendered, setRendered] = useState(false);
  return (
    <div className="relative mx-auto" style={{ width: width * scale, height: width * aspectRatio * scale }}>
      {/* CSS zoom keeps the canvas stable throughout the transition. */}
      <div className={`origin-top-left shadow-sm transition-[transform,opacity] duration-150 ease-out motion-reduce:transition-none ${rendered ? "opacity-100" : "opacity-0"}`} style={{ width, transform: `scale(${scale})` }}>
        <Page pdf={pdf} pageNumber={pageNumber} width={width} devicePixelRatio={2}
          renderTextLayer={false} renderAnnotationLayer={false}
          onLoadSuccess={page => setAspectRatio(page.originalHeight / page.originalWidth)}
          onLoadError={onError} onRenderError={onError} onRenderSuccess={() => setRendered(true)}
          loading={null} error={null} />
      </div>
      {!rendered && <p role="status" className="absolute inset-x-0 top-24 text-center text-sm text-stone-600">Opening page {pageNumber}…</p>}
    </div>
  );
}
