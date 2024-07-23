import { LazyLoadComponent } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";

interface VideoEmbedProps {
  src: string;
  className: string;
  autoplay?: boolean;
}

const VideoEmbed: React.FC<VideoEmbedProps> = ({
  src,
  className,
  autoplay,
}) => {
  return (
    <LazyLoadComponent>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${src}?rel=0&showinfo=0&modestbranding=1&color=white&autoplay=${
          autoplay ? autoplay : 1
        }`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={className}
      />
    </LazyLoadComponent>
  );
};

export default VideoEmbed;
