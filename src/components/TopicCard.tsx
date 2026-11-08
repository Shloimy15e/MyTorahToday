import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Subtopic from "@/types/Subtopic";
import Topic from "@/types/Topic";

export default function TopicCard({ topic, isSubtopic }: {
  topic: Topic | Subtopic;
  isSubtopic: boolean;
}) {
  const subtopics = isSubtopic ? [] : (topic as Topic).subtopics;
  return (
    <Link href={isSubtopic ? `/subtopics/${topic.id}` : `/topics/${topic.id}`} className="group flex h-full min-h-28 items-center justify-between gap-5 rounded-xl border border-stone-300 bg-stone-200/80 p-6 transition-[background-color,border-color] duration-300 hover:border-primary-blue hover:bg-primary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue sm:p-7">
      <div className="min-w-0">
        <h3 className="learning-display text-3xl leading-tight text-stone-950 transition-colors duration-200 group-hover:text-white">{topic.name}</h3>
        {subtopics.length > 0 && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stone-700 transition-colors duration-200 group-hover:text-blue-50">{subtopics.slice(0, 3).map(subtopic => subtopic.name).join(" · ")}</p>}
      </div>
      <ArrowUpRightIcon className="h-5 w-5 shrink-0 text-primary-blue transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white motion-reduce:transform-none" aria-hidden="true" />
    </Link>
  );
}
