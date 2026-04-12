import Link from "next/link";
import Subtopic from "@/types/Subtopic";
import Topic from "@/types/Topic";

export default function TopicCard(props: {
  topic: Topic | Subtopic;
  isSubtopic: boolean;
}) {
  return (
    <Link
      href={
        props.isSubtopic
          ? `/subtopics/${props.topic.id}`
          : `/topics/${props.topic.id}`
      }
      className="group relative bg-[linear-gradient(270.28935250198776deg,_#224395_6%,_#000000_94%)] w-full aspect-video rounded-2xl shadow-md hover:shadow-xl hover:scale-[1.03] hover:cursor-pointer flex overflow-hidden gap-3 flex-col justify-center items-center p-4 transition-card"
    >
      <div className="flex flex-col justify-between items-start w-full h-full p-4">
        <h1 className="text-4xl font-extrabold font-serif text-white tracking-wide rounded-xl">
          {props.isSubtopic
            ? (props.topic as Subtopic).name
            : (props.topic as Topic).name}
        </h1>
        {!props.isSubtopic && (
          <p className="text-white text-center text-lg font-semibold">
            {(props.topic as Topic).subtopics
              .slice(0, 3)
              .map((subtopic: any, index: number) => (
                <span key={subtopic.id}>
                  {subtopic.name}

                  {index <
                  Math.min(2, (props.topic as Topic).subtopics.length - 1)
                    ? ", "
                    : "."}
                </span>
              ))}

            {(props.topic as Topic).subtopics.length > 3 && ".."}
          </p>
        )}{" "}
      </div>
    </Link>
  );
}
