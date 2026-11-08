import { VideoCardSkeleton } from "./ui/LoadingSkeletons";

export default function LoadingVideoCardAnimation() {
  return <div aria-hidden="true" className="motion-safe:animate-pulse"><VideoCardSkeleton /></div>;
}
