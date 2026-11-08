import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Video from "@/types/Video";
import VideoCard from "./VideoCard";

export default function VideoGrid(props: {
  videos: Video[];
  title: string;
  topic: string | number;
  topic_name: string;
  showAll: boolean;
  topicVideos: boolean;
  showLinkAlways?: boolean;
  isThereText?: boolean;
  hideTitle?: boolean;
}) {
  const destination = props.topicVideos ? `/topics/${props.topic}` : `/subtopics/${props.topic}`;

  return (
    <section aria-label={props.title} className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
      {(!props.hideTitle || !props.showAll || props.showLinkAlways) && (
        <div className="mb-7 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          {!props.hideTitle && <h2 className="learning-display text-3xl tracking-tight text-stone-900 sm:text-4xl">{props.title}</h2>}
          {(!props.showAll || props.showLinkAlways) && props.videos.length > 0 && (
            <Link href={destination} aria-label={`View all ${props.topic_name} teachings`} className="group inline-flex min-h-11 items-center gap-2 rounded text-sm font-medium text-primary-blue underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">
              View all <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
      {props.isThereText && <a href="#sefaria-text-component" className="mb-6 inline-flex min-h-11 items-center rounded text-sm font-medium text-primary-blue underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">Read the source</a>}
      {props.videos.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-7 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(props.showAll ? props.videos : props.videos.slice(0, 8)).map((video, index) => (
            <div key={video.id} className={!props.showAll ? index >= 6 ? "hidden xl:block" : index >= 4 ? "hidden sm:block" : undefined : undefined}>
              <VideoCard video={video} />
            </div>
          ))}
        </div>
      ) : <p className="rounded-xl bg-white px-6 py-8 text-stone-600">No teachings here yet. Explore another topic to keep learning.</p>}
    </section>
  );
}
