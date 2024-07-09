interface VideoEmbedProps {
    src: string;
    title: string;
    className: string;
  }
  
  const VideoEmbed: React.FC<VideoEmbedProps> = ({
    src,
    title,
    className,
  }) => {
    return (
      <div className={className}>
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy= "strict-origin-when-cross-origin"
          allowFullScreen
          className="rounded-2xl shadow-lg border-0"
        />
      </div>
    );
  };
  
  export default VideoEmbed;