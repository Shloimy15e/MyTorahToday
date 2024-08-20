import TopicCard from "./TopicCard";
import Topic from "@/types/Topic";

export default function TopicGrid(props: {
  topics: Topic[];
  areSubtopics: boolean;
}){
    return (
        <div>
            <h1 className=" leading-relaxed pb-4 relative text-4xl font-bold my-6 ml-10 text-gray-900 before:content-[''] before:absolute before:left-1 before:bottom-0 before:h-[5px] before:w-[55px] before:bg-gray-900 after:content-[''] after:absolute after:left-0 after:bottom-0.5 after:h-[1px] after:w-[95%] after:max-w-[255px] after:bg-gray-900">
              {props.areSubtopics ? "Subtopics" : "Topics"}
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
            {props.topics.map((topic: Topic) => (
                <TopicCard
                    topic={topic}
                    key={topic.id}
                    isSubtopic={props.areSubtopics}
                />
            ))}
            </div>
        </div>
    );
}
