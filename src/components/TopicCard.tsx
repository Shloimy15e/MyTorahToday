import Link from "next/link";

export default function TopicCard(props: {
  topic: any;
  isSubtopic: boolean;
  subtopic?: any;
}) {
  return (
    <Link
      href={
        props.isSubtopic
          ? `/topics/${props.topic.name.toLowerCase()}/${props.subtopic.name.toLowerCase()}`
          : `/topics/${props.topic.name.toLowerCase()}`
      }
      className="group relative bg-[linear-gradient(270.28935250198776deg,_#224395_6%,_#000000_94%)] w-full aspect-video rounded-2xl shadow-md transition hover:scale-105 hover:cursor-pointer duration-300 flex overflow-hidden gap-3 flex-col justify-center items-center p-4"
    >
      <div className="flex flex-col justify-center items-center w-full h-full">
        <h1 className="text-4xl font-extrabold font-serif p-4 text-white tracking-wide rounded-xl">
          {props.isSubtopic ? props.subtopic.name : props.topic.name}
        </h1>
      </div>
    </Link>
  );
}
