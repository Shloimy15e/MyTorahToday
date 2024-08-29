import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import VideoEmbed from "./VideoEmbed";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  HandThumbUpIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import Video from "@/types/Video";
import LikeButtonAndCount from "./ui/LikeButtonAndCount";
import SaveButton from "./ui/SaveButton";
import { CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";
import formatDuration from "@/utils/formatDuration";

export default function VideoDialog(props: {
  isOpen: boolean;
  video: Video;
  onClose: () => void;
}) {
  const closeModal = () => props.onClose();
  const lowerCaseTopicName = props.video?.topic_name?.toLowerCase() ?? "";
  const lowerCaseSubtopicName = props.video?.subtopic_name?.toLowerCase() ?? "";
  const lowercaseTitle = props.video?.title?.toLowerCase() ?? "";
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
            <div className="flex min-h-1/2 items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-4xl md:max-w-2xl lg:max-w-3xl 2xl:max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="mt-2">
                    <VideoEmbed
                      src={props.video.video_id}
                      className="w-full aspect-video rounded-md"
                    />
                  </div>

                  {/* Likes and other info */}
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 my-2"
                  >
                    {props.video.title}
                  </DialogTitle>
                  <div className="flex items-center justify-start gap-6">
                    <span>
                      <LikeButtonAndCount
                        videoId={props.video.id}
                        likes={props.video.likes + props.video.userLikes}
                        isLiked={props.video.is_liked_by_user}
                      />
                    </span>
                    <span>
                      <SaveButton
                        videoId={props.video.id}
                        isSaved={props.video.is_saved_by_user}
                      />
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col items-center justify-between w-full bg-neutral-200 p-2 rounded-lg">
                    <div className="px-4 my-2 flex items-center justify-between w-full">
                      <span className="text-gray-500">
                        {props.video.topic_name} - {props.video.subtopic_name}
                      </span>
                      <span className="text-gray-500 flex items-center justify-center gap-2">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                        {props.video.publishedAt &&
                          new Date(props.video.publishedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                      </span>
                      <span className="text-gray-500 ml-4 flex items-center justify-center gap-2">
                        {props.video.views + props.video.userViews}
                        <EyeIcon
                          className="inline h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </span>
                    </div>
                    <p>{props.video.description}</p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      <ArrowLeftIcon className="h-5 w-6 mr-2" />
                      Return to video list
                    </button>
                    <Link
                      href={`/topics/${lowerCaseTopicName}/${lowerCaseSubtopicName}/${props.video.video_id}`}
                      className="inline-flex justify-center rounded-md border border-transparent bg-primary-blue px-4 py-2 text-sm font-medium text-white hover:bg-blue-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ml-4"
                      onClick={closeModal}
                      aria-label="Go to video page"
                      title="Go to video page"
                      role="button"
                      aria-hidden="false"
                      tabIndex={0}
                    >
                      See video page
                      <ArrowRightIcon className="h-5 w-6 ml-2" />
                    </Link>
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
