"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [loaded, setLoaded] = useState(false);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      const observer = new ResizeObserver((entries) => {
        setContainerWidth(entries[0].contentRect.width);
      });
      observer.observe(node);
    }
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoaded(true);
  }

  const goToPrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNext = () => setPageNumber((p) => Math.min(numPages, p + 1));
  const zoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.25).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)));

  const pageWidth = containerWidth
    ? Math.min(containerWidth - 48, 850) * scale
    : undefined;

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center"
      style={{ background: "linear-gradient(to bottom, #f5f0e8, #ede7db)" }}
    >
      {/* Reading area */}
      <div className="overflow-auto w-full flex flex-col items-center px-4 sm:px-6"
        style={{ maxHeight: "80vh" }}
      >
        {/* Top breathing room */}
        <div className="h-6 sm:h-10 shrink-0" />

        {/* The page — styled like a physical sheet */}
        <div
          className={`transition-all duration-500 ${
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            boxShadow: "0 2px 20px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.1)",
          }}
        >
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-600 rounded-full animate-spin" />
                <span className="text-sm text-stone-400 tracking-wide">Loading journal...</span>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-48 gap-2">
                <span className="text-stone-400 text-sm">Unable to load this journal</span>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="rounded-sm"
            />
          </Document>
        </div>

        {/* Bottom breathing room */}
        <div className="h-6 sm:h-10 shrink-0" />
      </div>

      {/* Controls — floating at bottom, minimal and receding */}
      {loaded && numPages > 0 && (
        <div className="sticky bottom-4 z-10 mb-4 flex items-center gap-1 px-2 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-stone-200/60">
          {/* Zoom out */}
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom out"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-stone-200" />

          {/* Previous page */}
          <button
            onClick={goToPrev}
            disabled={pageNumber <= 1}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.5 3L5 7l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Page indicator */}
          <span className="text-xs text-stone-500 tabular-nums px-1.5 select-none min-w-[44px] text-center">
            {pageNumber} of {numPages}
          </span>

          {/* Next page */}
          <button
            onClick={goToNext}
            disabled={pageNumber >= numPages}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5.5 3L9 7l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-px h-4 bg-stone-200" />

          {/* Zoom in */}
          <button
            onClick={zoomIn}
            disabled={scale >= 2.5}
            className="w-8 h-8 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom in"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
