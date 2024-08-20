export default function TopicSkeleton(props: {
    isSubtopic: boolean;
  }) {
    return (
      <div className="group bg-[linear-gradient(270.28935250198776deg,_#224395_6%,_#000000_94%)] w-full aspect-video rounded-2xl shadow-md duration-300 flex overflow-hidden gap-3 flex-col justify-center items-center p-4">
        <div className="flex flex-col justify-between items-start w-full h-full p-4">
          <h1 className="text-xl font-bold text-left px-5 w-full">
            <div className="h-11 w-3/5 bg-gray-50 animate-pulse rounded-full"></div>
          </h1>
          {!props.isSubtopic && (
            <div className="text-white text-center text-lg font-semibold flex">
              <div className="h-5 w-24 bg-gray-50 animate-pulse rounded-full m-1"></div>
              <div className="h-5 w-20 bg-gray-50 animate-pulse rounded-full m-1"></div>
              <div className="h-5 w-28 bg-gray-50 animate-pulse rounded-full m-1"></div>
            </div>
          )}{" "}
        </div>
      </div>
    );
  }
  