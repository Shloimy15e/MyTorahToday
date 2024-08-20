import Link from "next/link";

export default function TopicCard(props: {
  topic?: any;
  isSubtopic: boolean;
  subtopic?: any;
}) {
  const hrefTopic = props.isSubtopic
    ? props.subtopic.topic_name.toLowerCase().replace(" ", "-")
    : props.topic.name.toLowerCase().replace(" ", "-");
  const hrefSubtopic = props.isSubtopic
    ? props.subtopic.name.toLowerCase().replace(/ /g, "-")
    : null;
  return (
    <Link
      href={
        props.isSubtopic
          ? `/topics/${hrefTopic}/${hrefSubtopic}`
          : `/topics/${hrefTopic}`
      }
      className="group relative bg-[linear-gradient(270.28935250198776deg,_#224395_6%,_#000000_94%)] w-full aspect-video rounded-2xl shadow-md transition hover:scale-105 hover:cursor-pointer duration-300 flex overflow-hidden gap-3 flex-col justify-center items-center p-4"
    >
      <div className="flex flex-col justify-between items-start w-full h-full p-4">
        <h1 className="text-4xl font-extrabold font-serif text-white tracking-wide rounded-xl">
          {props.isSubtopic ? props.subtopic.name : props.topic.name}
        </h1>
        {!props.isSubtopic && (
          <p className="text-white text-center text-lg font-semibold">
            {props.topic.subtopics
              .slice(0, 3)
              .map((subtopic: any, index: number) => (
                <span key={subtopic.id}>
                  {subtopic.name}
                  {index < Math.min(2, props.topic.subtopics.length - 1)
                    ? ", "
                    : "."}
                </span>
              ))}
            {props.topic.subtopics.length > 3 && ".."}
          </p>
        )}{" "}
      </div>
    </Link>
  );
}
