export default function VideoEmbed({
  src,
  className,
  autoplay,
  title = "Torah teaching",
}: {
  src: string;
  className: string;
  autoplay?: boolean;
  title?: string;
}) {
  return (
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${src}?rel=0&showinfo=0&modestbranding=1&color=white&autoplay=${
        autoplay === false ? 0 : 1
      }`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title={title}
      className={className}
      loading="lazy"
    />
  );
}
