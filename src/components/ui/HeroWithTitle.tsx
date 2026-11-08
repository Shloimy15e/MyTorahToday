export default function HeroWithTitle({ title, description }: { title: string; description?: string | null }) {
  return (
    <header className="mx-auto w-full max-w-7xl px-5 pb-6 pt-12 sm:px-8 sm:pt-16 lg:px-12">
      <h1 className="learning-display max-w-4xl text-5xl leading-[1.08] tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">{title}</h1>
      {description && <p className="mt-6 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">{description}</p>}
    </header>
  );
}
