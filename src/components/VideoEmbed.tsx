export default function VideoEmbed({
  src,
  className,
  autoplay,
}: {
  src: string;
  className: string;
  autoplay: boolean;
}) {
  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${src}?rel=0&showinfo=0&modestbranding=1&color=white&autoplay=${
        autoplay ? autoplay : 1
      }`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className={className}
      loading="lazy"
    />
  );
}
