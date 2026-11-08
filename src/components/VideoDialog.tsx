"use client";

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import Link from "next/link";
import LikeButtonAndCount from "./ui/LikeButtonAndCount";
import SaveButton from "./ui/SaveButton";
import Video from "@/types/Video";
import VideoEmbed from "./VideoEmbed";
import ShareButtons from "@/app/(inner layout)/videos/[video_id]/components/ShareButtons";
import ViewCount from "@/app/(inner layout)/videos/[video_id]/components/ViewCount";

export default function VideoDialog({ isOpen, video, onClose }: {
  isOpen: boolean;
  video: Video;
  onClose: () => void;
}) {
  if (!video.id) return null;
  return <Transition show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <TransitionChild as={Fragment} enter="ease-out duration-200 motion-reduce:transition-none" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-out duration-150 motion-reduce:transition-none" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-stone-950/60" /></TransitionChild>
      <div className="fixed inset-0 overflow-y-auto p-3 sm:p-6"><div className="flex min-h-full items-center justify-center">
        <TransitionChild as={Fragment} enter="ease-out duration-300 motion-reduce:transition-none" enterFrom="translate-y-3 opacity-0" enterTo="translate-y-0 opacity-100" leave="ease-out duration-150 motion-reduce:transition-none" leaveFrom="translate-y-0 opacity-100" leaveTo="translate-y-3 opacity-0">
          <DialogPanel className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white p-4 shadow-2xl sm:rounded-[1.5rem] sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4"><DialogTitle className="pt-1 font-sans text-2xl font-semibold leading-[1.25] text-stone-900 sm:text-3xl lg:text-[32px]">{video.title}</DialogTitle><button type="button" onClick={onClose} aria-label="Close video" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-600 transition-colors duration-200 hover:bg-stone-200 motion-reduce:transition-none"><XMarkIcon className="h-5 w-5" /></button></div>
            <div className="aspect-video overflow-hidden rounded-xl bg-stone-900"><VideoEmbed src={video.video_id} className="h-full w-full" autoplay={false} /></div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-stone-600">Rabbi Shimon Semp</p>{isOpen && <span className="inline-flex items-center gap-1.5 text-sm text-stone-600"><ViewCount key={video.id} views={video.views + video.userViews} isViewed={video.is_viewed_by_user} videoId={video.id} /></span>}</div>
            <div className="mt-5 flex flex-wrap items-center gap-2"><LikeButtonAndCount videoId={video.id} likes={video.likes + video.userLikes} isLiked={video.is_liked_by_user} /><SaveButton videoId={video.id} isSaved={video.is_saved_by_user} showLabel /><ShareButtons video={video} /></div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button type="button" onClick={onClose} className="inline-flex min-h-11 items-center px-2 text-sm text-stone-600 hover:text-primary-blue">Back to teachings</button><Link href={`/videos/${video.id}`} onClick={onClose} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary-blue px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-950 motion-reduce:transition-none">Open teaching<ArrowRightIcon aria-hidden="true" className="h-4 w-4" /></Link></div>
          </DialogPanel>
        </TransitionChild>
      </div></div>
    </Dialog>
  </Transition>;
}
