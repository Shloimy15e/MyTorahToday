"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Transition } from "@headlessui/react";
import DOMPurify from "dompurify";

export default function SefariaText({ text, title }: { text: string[], title: string }) {
  const [showMore, setShowMore] = useState(false);
  const [showEverything, setShowEverything] = useState(false);
  const showMoreRef = useRef<HTMLDivElement>(null);
  const showEverythingRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const purify = typeof window !== "undefined" ? DOMPurify(window) : null;
  const sanitizedTextArray = text.map((item) =>
    purify ? purify.sanitize(item) : item
  );
  const initialRender = useRef(true);

  useEffect(() => {
    const scrollOptions: ScrollIntoViewOptions = {
      behavior: "smooth",
      block: "start",
    };
    const targetRef =
      !showMore && showEverything
        ? showEverythingRef
        : showMore
        ? showMoreRef
        : textRef;

    const handleScroll = () => {
      if (targetRef.current) {
        targetRef.current.scrollIntoView(scrollOptions);
      }
    };

    //Only run this when user interacts with the show more button
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      handleScroll();
    }
  }, [showMore, showEverything]);
  return (
    <div
      className="bg-white rounded-lg shadow-lg p-6 m-6 transition-all duration-500 font-serif text-2xl leading-relaxed tracking-wide"
      id="sefaria-text-component"
    >
      <h2 className="text-4xl font-bold mb-4 text-right">{title}</h2>
      <p
        ref={textRef}
        className="mb-4 text-right overflow-hidden transition-all duration-1000 ease-in-out"
        dangerouslySetInnerHTML={{ __html: sanitizedTextArray[0] }}
      />
      <Transition
        as="div"
        show={showMore || showEverything}
        enter="transition-all duration-500 ease-in-out"
        enterFrom="max-h-0 opacity-0 transform scale-95"
        enterTo="max-h-screen opacity-100 transform scale-100"
        leave="transition-all duration-500 ease-in-out"
        leaveFrom="max-h-screen opacity-100 transform scale-100"
        leaveTo="max-h-0 opacity-0 transform scale-95"
      >
        <p
          ref={showMoreRef}
          className="mb-4 text-right overflow-hidden transition-all duration-1000 ease-in-out"
          dangerouslySetInnerHTML={{
            __html: sanitizedTextArray.slice(1, 3).join(" "),
          }}
        ></p>
      </Transition>
      <Transition
        show={!showMore && showEverything}
        enter="transition-all duration-500 ease-in-out"
        enterFrom="max-h-0 opacity-0 transform scale-95"
        enterTo="max-h-screen opacity-100 transform scale-100"
        leave="transition-all duration-500 ease-in-out"
        leaveFrom="max-h-screen opacity-100 transform scale-100"
        leaveTo="max-h-0 opacity-0 transform scale-95"
      >
        <p
          ref={showEverythingRef}
          className="mb-4 text-right overflow-hidden transition-all duration-1000 ease-in-out"
          dangerouslySetInnerHTML={{
            __html: sanitizedTextArray.slice(3).join(" "),
          }}
        ></p>
      </Transition>
      <div className="flex justify-center text-lg font-mono leading-normal tracking-normal">
        <button
          onClick={() => {
            showMore
              ? (setShowMore(!showMore), setShowEverything(!showEverything))
              : setShowEverything(!showEverything);
          }}
          className="flex text-lg items-center justify-center gap-5 bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-5 my-1 w-4/5"
        >
          <ChevronDownIcon
            strokeWidth={3}
            className={`w-7 h-7 transition ${
              !showMore && showEverything ? "rotate-180" : ""
            }`}
          />
          <span>{showEverything ? "Show Least" : "Show Everything"}</span>
          <ChevronDownIcon
            strokeWidth={3}
            className={`w-7 h-7 transition ${
              !showMore && showEverything ? "rotate-180" : ""
            }`}
          />
        </button>
        <button
          onClick={() => {
            const component = document.getElementById("sefaria-text-component");
            if (component) {
              component.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="flex text-lg items-center justify-center gap-5 bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-5 my-1 w-4/5"
        >
          Return to Start
        </button>
        <button
          onClick={() => {
            showEverything
              ? (setShowEverything(!showEverything), setShowMore(!showMore))
              : setShowMore(!showMore);
          }}
          className="flex text-lg items-center justify-center gap-5 bg-primary-blue text-gray-100 text-center font-semibold px-6 py-2 rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer hover:bg-blue-950 mx-5 my-1 w-4/5"
        >
          <ChevronUpIcon
            strokeWidth={3}
            className={`w-7 h-7 transition ${
              !showMore && !showEverything ? "rotate-180" : ""
            }`}
          />
          <span>{showMore || showEverything ? "Show Less" : "Show More"}</span>
        </button>
      </div>
    </div>
  );
}
