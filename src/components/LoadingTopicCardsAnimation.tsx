import { TopicCardSkeleton } from "./ui/LoadingSkeletons";

export default function LoadingTopicCardAnimation({ isSubtopic }: { isSubtopic: boolean }) {
  return <div aria-hidden="true" className="motion-safe:animate-pulse"><TopicCardSkeleton isSubtopic={isSubtopic} /></div>;
}
