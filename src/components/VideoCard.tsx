import VideoEmbed from "./VideoEmbed";

export interface Video {
    id: number;
    title: string;
    embedUrl: string;
    topic: string;
    tags: string[];
}

// A card that has the videoEmbed in it and takes a video from a video list by a parent
function VideoCard(props: { video: Video, onClick: () => void }) {
  return (
    <div onClick={props.onClick}
      className="group relative bg-white w-full h-full rounded-2xl shadow-md pb-3 transition hover:scale-105 hover:cursor-pointer duration-300">
      <VideoEmbed
        src={props.video.embedUrl}
        title={props.video.title}
        className="w-full rounded-t-2xl aspect-video"
      />
      <h1 className="text-xl font-bold text-left my-4 px-5 w-full">
        {props.video.title}
      </h1>
      {/* loop through tags */}
      <div className="flex flex-wrap justify-start items-center pl-5 w-full">
        {props.video.tags.map((tag: string) => (
          <p
            key={tag}
            className="text-sm text-gray-600 w-fit p-2 bg-gray-100 rounded-2xl leading-3 m-1"
          >
            {tag}
          </p>
        ))}
      </div>
    </div>
  );
}

export default VideoCard;
