import { PlayIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import formatDuration from "@/utils/formatDuration";
import Video from "@/types/Video";
import SaveButton from "./ui/SaveButton";

export default function VideoCard({ video }: {
  video: Video;
  onClick?: () => void;
  showDescription?: boolean;
}) {
  return (
    <article className="relative min-w-0 w-full">
      <Link href={`/videos/${video.id}`} className="group block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-stone-200">
          <Image
            fill
            sizes="(min-width: 1280px) 280px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            src={`https://i.ytimg.com/vi/${video.video_id}/hqdefault.jpg`}
            alt=""
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transform-none"
          />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/15 group-focus-visible:bg-black/15">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-primary-blue shadow-md transition-[transform,background-color] duration-300 group-hover:scale-110 group-hover:bg-white motion-reduce:transform-none">
              <PlayIcon className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
            </span>
          </span>
          <span className="absolute bottom-3 right-3 rounded bg-stone-950/85 px-2 py-1 text-xs tabular-nums text-white">{formatDuration(video.duration)}</span>
        </div>
        <div className="pr-12 pt-4">
          <h3 className="text-base font-semibold leading-snug text-stone-900 transition-colors duration-200 group-hover:text-primary-blue">{video.title}</h3>
          <span className="mt-2 inline-block text-sm text-stone-500">{video.is_viewed_by_user ? "Watch again" : "Watch teaching"}</span>
        </div>
      </Link>
      <div className="absolute bottom-0 right-0 rounded-full bg-stone-50">
        <SaveButton key={video.id} videoId={video.id} isSaved={video.is_saved_by_user} />
      </div>
    </article>
  );
}
