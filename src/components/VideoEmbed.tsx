import { LazyLoadComponent } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/opacity.css';

interface VideoEmbedProps {
    src: string;
    title: string;
    className: string;
  }
  
  const VideoEmbed: React.FC<VideoEmbedProps> = ({
    src,
    className,
  }) => {
    return (
      <LazyLoadComponent>
        <iframe
          src={`https://www.youtube.com/embed/${src}?rel=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          className={className}
        />
      </LazyLoadComponent>
    );
  };
  
  export default VideoEmbed;