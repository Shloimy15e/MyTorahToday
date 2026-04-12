"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { IoChevronBack, IoChevronForward, IoRemove, IoAdd } from "react-icons/io5";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [containerWidth, setContainerWidth] = useState<number>(0);

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
  }

  const goToPrev = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNext = () => setPageNumber((p) => Math.min(numPages, p + 1));
  const zoomIn = () => setScale((s) => Math.min(2, s + 0.2));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.2));

  return (
    <div ref={containerRef} className="flex flex-col items-center bg-neutral-100 rounded-xl">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between w-full px-4 py-2.5 bg-white/90 backdrop-blur border-b border-gray-200 rounded-t-xl">
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrev}
            disabled={pageNumber <= 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Previous page"
          >
            <IoChevronBack className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 tabular-nums min-w-[60px] text-center">
            {pageNumber} / {numPages || "\u2013"}
          </span>
          <button
            onClick={goToNext}
            disabled={pageNumber >= numPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Next page"
          >
            <IoChevronForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Zoom out"
          >
            <IoRemove className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 tabular-nums min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Zoom in"
          >
            <IoAdd className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF page */}
      <div className="overflow-auto w-full max-h-[75vh] py-4 flex flex-col items-center">
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-blue border-t-transparent" />
            </div>
          }
          error={
            <div className="flex items-center justify-center h-48 text-gray-500">
              Failed to load PDF
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            width={containerWidth ? Math.min(containerWidth - 32, 800) : undefined}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
}
