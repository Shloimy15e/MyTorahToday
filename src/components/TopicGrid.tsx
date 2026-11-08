"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import TopicCard from "./TopicCard";
import Topic from "@/types/Topic";
import Subtopic from "@/types/Subtopic";

export default function TopicGrid(props: {
  topics: Topic[] | Subtopic[];
  areSubtopics: boolean;
  showAll: boolean;
  hideTitle?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const gridId = useId();
  const topics = props.topics.filter(topic => props.areSubtopics || (topic as Topic).subtopics.length > 0);
  const label = props.areSubtopics ? "Subtopics" : "Topics";

  return (
    <section id="topics" aria-label={label} className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
      {!props.hideTitle && <h2 className="learning-display mb-7 text-3xl tracking-tight text-stone-900 sm:text-4xl">{props.areSubtopics ? "Explore the subtopics" : "Explore by topic"}</h2>}
      {topics.length > 0 ? (
        <motion.div id={gridId} layout={!reduceMotion} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => (
            <motion.div key={topic.id} layout={reduceMotion ? false : "position"} initial={false} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className={!props.showAll && !expanded && index >= 6 ? "hidden" : !props.showAll && !expanded && index >= 4 ? "hidden sm:block" : undefined}>
              <TopicCard topic={topic} isSubtopic={props.areSubtopics} />
            </motion.div>
          ))}
        </motion.div>
      ) : <p className="rounded-xl bg-white px-6 py-8 text-stone-600">Topics will appear here as the library grows.</p>}
      {!props.showAll && topics.length > 4 && (
        <div className={`mt-6 ${topics.length <= 6 ? "sm:hidden" : ""}`}>
          <button type="button" aria-expanded={expanded} aria-controls={gridId} onClick={() => setExpanded(value => !value)} className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors duration-200 hover:border-primary-blue hover:bg-white hover:text-primary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">
            {expanded ? `Show fewer ${label.toLowerCase()}` : `Show all ${label.toLowerCase()}`}
            <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
