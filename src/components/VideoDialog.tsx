import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import VideoEmbed from "./VideoEmbed";

export interface Video {
  id: number;
  title: string;
  video_id: string;
  topic: string;
  tags: string[];
}

export interface VideoDetails {
  likes: number;
  views: number;
  description?: string;
  publishedAt: string;
}

export default function VideoDialog(props: {
  isOpen: boolean;
  video: Video | null;
  videoDetails: object;
  onClose: () => void;
}) {
  const closeModal = () => props.onClose();
  return (
    <>
      <Transition show={props.isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/45" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-4xl md:max-w-2xl lg:max-w-4xl 2xl:max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {props.video ? props.video.title : "Loading"}
                  </DialogTitle>
                  <div className="mt-2">
                    <VideoEmbed
                      src={props.video ? props.video.video_id : ""}
                      className="w-full aspect-video rounded-md"
                    />
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Beautiful! I want to see more!
                    </button>
                  </div>
                  {/* Likes and other info */}
                  <div className="mt-4">
                    <p>0 likes · 0 views · 0 comments · 0 shares</p>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
