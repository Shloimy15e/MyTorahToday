import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import VideoEmbed from "./VideoEmbed";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import Video from "@/types/Video";
import LikeButtonAndCount from "./ui/LikeButtonAndCount";
import SaveButton from "./ui/SaveButton";
import { incrementViewCount } from "@/lib/incrementViewCount";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useSessionContext } from "@/context/SessionContext";
import {
  EmailShareButton,
  EmailIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "next-share";
import { set } from "zod";
import { IoMdEye } from "react-icons/io";

export default function VideoDialog(props: {
  isOpen: boolean;
  video: Video;
  onClose: () => void;
}) {
  const closeModal = () => props.onClose();
  const lowerCaseTopicName = props.video?.topic_name?.toLowerCase() ?? "";
  const lowerCaseSubtopicName = props.video?.subtopic_name?.toLowerCase() ?? "";
  const lowercaseTitle = props.video?.title?.toLowerCase() ?? "";
  const [isViewed, setIsViewed] = useState(props.video.is_viewed_by_user);
  const [viewCount, setViewCount] = useState(0);
  const { session } = useSessionContext();

  useEffect(() => {
    setIsViewed(props.video.is_viewed_by_user);
    setViewCount(props.video.views + props.video.userViews);
  }, [props.video.is_viewed_by_user, props.video.userViews, props.video.views]);

  const timeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    timeoutRef.current = setTimeout(async () => {
      if (session && !props.video.is_viewed_by_user && props.video.id) {
        const response = await incrementViewCount(props.video.id);
        if (!response.ok) {
          console.error("Failed to increment view count");
        }
        console.log(await response.json());
        setIsViewed(true);
        setViewCount((prev) => prev + 1);
      }
    }, 5000);
  
    return () => clearTimeout(timeoutRef.current);
  }, [props.video.id, session, props.video.is_viewed_by_user]);

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
                <DialogPanel className="w-full max-w-4xl md:max-w-2xl lg:max-w-3xl 2xl:max-w-5xl transform overflow-hidden rounded-2xl bg-white p-4 md:p-6 text-left align-middle shadow-xl transition-all">
                  <div className="mt-2">
                    <VideoEmbed
                      src={props.video.video_id}
                      className="w-full aspect-video rounded-md"
                    />
                  </div>

                  {/* Likes and other info */}
                  <DialogTitle
                    as="h3"
                    className="text-lg text-start overflow-hidden font-medium leading-6 text-gray-900 my-2"
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
                    <span
                      title="Share via Email"
                      className="flex items-center justify-center"
                    >
                      <EmailShareButton
                        url={`${process.env.NEXT_PUBLIC_BASE_URL}/topics/${lowerCaseTopicName}/${lowerCaseSubtopicName}/${props.video.video_id}`}
                        subject={`R' Shimon Semp - ${props.video.title?.slice(
                          0,
                          50
                        )}`}
                        body={`Check out this video by R' Shimon Semp: ${process.env.NEXT_PUBLIC_BASE_URL}/topics/${lowerCaseTopicName}/${lowerCaseSubtopicName}/${props.video.video_id}`}
                        blankTarget={true}
                      >
                        <EmailIcon className="w-9 h-9" round />
                      </EmailShareButton>
                    </span>
                    <span
                      title="Share on Whatsapp"
                      className="flex items-center justify-center"
                    >
                      <WhatsappShareButton
                        url={`${process.env.NEXT_PUBLIC_BASE_URL}/topics/${lowerCaseTopicName}/${lowerCaseSubtopicName}/${props.video.video_id}`}
                        title={`R' Shimon Semp - ${props.video.title?.slice(
                          0,
                          50
                        )}`}
                        separator=":: "
                        blankTarget={true}
                      >
                        <WhatsappIcon className="w-9 h-9" round />
                      </WhatsappShareButton>
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col items-center justify-between w-full bg-neutral-200 p-2 rounded-lg">
                    <div className="md:px-4 my-2 flex flex-col gap-2 md:flex-row items-start justify-between w-full">
                      <span className="text-gray-500">
                        <Link
                          href={`/topics/${lowerCaseTopicName}`}
                          className=" hover:underline"
                        >
                          {props.video.topic_name}
                        </Link>{" "}
                        -{" "}
                        <Link
                          href={`/topics/${lowerCaseTopicName}/${lowerCaseSubtopicName}`}
                          className=" hover:underline"
                        >
                          {props.video.subtopic_name}
                        </Link>
                      </span>
                      <div className="flex justify-between w-full md:w-auto">
                        <span className="text-gray-500 flex items-center justify-start gap-2">
                          <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                          {props.video.publishedAt
                            ? new Intl.DateTimeFormat("en-US", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              }).format(new Date(props.video.publishedAt))
                            : "N/A"}
                        </span>
                        <span className="text-gray-500 ml-4 flex items-center justify-center gap-2">
                          {viewCount}
                          <IoMdEye
                            className={`inline h-5 w-5 ${
                              isViewed ? "text-primary-blue" : "text-gray-400"
                            }`}
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                    </div>
                    <p className="text-start w-full overflow-clip">
                      {props.video.description}
                    </p>
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
