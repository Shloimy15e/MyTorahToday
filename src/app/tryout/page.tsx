import LoadingAnimation from "@/components/LoadingAnimation";
import LoadingVideoCardAnimation from "@/components/LoadingVideoCardAnimation";
import LoadingTopicCardAnimation from "@/components/LoadingTopicCardsAnimation";

export default function Tryout() {
  return (
    <>
      <main>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-10 justify-items-center place-items-center align-middle w-full auto-rows-max p-10">
          <LoadingVideoCardAnimation />
          <LoadingTopicCardAnimation isSubtopic={false} />
          <LoadingTopicCardAnimation isSubtopic={true} />
        </div>
      </main>
    </>
  );
}
