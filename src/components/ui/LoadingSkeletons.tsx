import type { ReactNode } from "react";

const container = "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12";

function Block({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-stone-200 ${className}`} />;
}

function LoadingFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <main aria-busy="true" className="min-h-[65vh] bg-stone-50 pb-16">
      <p role="status" className="sr-only">{label}</p>
      <div aria-hidden="true" className="motion-safe:animate-pulse">{children}</div>
    </main>
  );
}

function BreadcrumbSkeleton() {
  return <div className={`${container} flex h-16 items-end pb-2 sm:h-14`}><Block className="h-3 w-36" /></div>;
}

function IntroSkeleton({ children }: { children?: ReactNode }) {
  return (
    <div className={`${container} pb-6 pt-12 sm:pt-16`}>
      <Block className="h-12 w-80 max-w-[80%] sm:h-16" />
      <div className="mt-6 max-w-xl space-y-2.5"><Block className="h-4 w-full" /><Block className="h-4 w-3/4" /></div>
      {children}
    </div>
  );
}

export function VideoCardSkeleton() {
  return (
    <div className="min-w-0">
      <Block className="aspect-video w-full rounded-xl" />
      <div className="pr-12 pt-4">
        <Block className="h-4 w-full" />
        <Block className="mt-2 h-4 w-3/4" />
        <Block className="mt-3 h-3 w-24 bg-stone-200/70" />
      </div>
    </div>
  );
}

export function TopicCardSkeleton({ isSubtopic = false }: { isSubtopic?: boolean }) {
  return (
    <div className="flex min-h-28 items-center rounded-xl bg-stone-200/80 p-6 sm:p-7">
      <div className="w-full">
        <Block className="h-7 w-3/5 bg-stone-300/70" />
        {!isSubtopic && <Block className="mt-3 h-3 w-4/5 bg-stone-300/60" />}
      </div>
    </div>
  );
}

function VideoGridSkeleton({ count = 8, title = true, threeColumns = false }: { count?: number; title?: boolean; threeColumns?: boolean }) {
  return (
    <div>
      {title && <Block className="mb-7 h-8 w-52 max-w-[70%] sm:h-10" />}
      <div className={`grid grid-cols-1 gap-x-7 gap-y-9 sm:grid-cols-2 lg:grid-cols-3 ${threeColumns ? "" : "xl:grid-cols-4"}`}>
        {Array.from({ length: count }, (_, index) => <VideoCardSkeleton key={index} />)}
      </div>
    </div>
  );
}

function TopicGridSkeleton({ title = false, isSubtopic = false }: { title?: boolean; isSubtopic?: boolean }) {
  return (
    <div>
      {title && <Block className="mb-7 h-8 w-64 max-w-[70%] sm:h-10" />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <TopicCardSkeleton key={index} isSubtopic={isSubtopic} />)}
      </div>
    </div>
  );
}

export function HomeLoading() {
  return (
    <LoadingFrame label="Loading the library…">
      <div className={`${container} grid gap-9 pb-8 pt-10 sm:pb-10 sm:pt-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16`}>
        <div>
          <Block className="h-11 w-60 max-w-full sm:h-14 sm:w-72" />
          <Block className="mt-2 h-11 w-52 max-w-full sm:h-14 sm:w-64" />
          <div className="mt-5 max-w-sm space-y-2.5"><Block className="h-4 w-full" /><Block className="h-4 w-4/5" /></div>
          <Block className="mt-7 h-12 w-40 rounded-full" />
        </div>
        <div>
          <Block className="aspect-video rounded-2xl" />
          <Block className="mt-4 h-5 w-4/5" />
          <Block className="mt-2 h-5 w-1/2" />
        </div>
      </div>
      <div className={`${container} py-10 sm:py-12`}><TopicGridSkeleton title /></div>
      <div className={`${container} py-10 sm:py-12`}><VideoGridSkeleton /></div>
    </LoadingFrame>
  );
}

export function TopicsLoading() {
  return (
    <LoadingFrame label="Loading topics…">
      <BreadcrumbSkeleton />
      <IntroSkeleton />
      <div className={`${container} py-10 sm:py-12`}><TopicGridSkeleton /></div>
    </LoadingFrame>
  );
}

export function TopicLoading() {
  return (
    <LoadingFrame label="Loading this topic…">
      <BreadcrumbSkeleton />
      <IntroSkeleton />
      <div className={`${container} py-10 sm:py-12`}><TopicGridSkeleton title isSubtopic /></div>
      <div className={`${container} py-10 sm:py-12`}><VideoGridSkeleton /></div>
    </LoadingFrame>
  );
}

export function SubtopicLoading() {
  return (
    <LoadingFrame label="Loading teachings and reading…">
      <BreadcrumbSkeleton />
      <div className={`${container} pb-2 pt-8 sm:pt-10`}>
        <Block className="h-12 w-52 max-w-[75%] sm:h-[76px] sm:w-72" />
        <div className="mt-5 max-w-2xl space-y-2.5"><Block className="h-4 w-full" /><Block className="h-4 w-5/6" /></div>
        <div className="flex gap-2 pb-5 pt-7 sm:gap-4"><Block className="h-11 w-24 rounded-full" /><Block className="h-11 w-24 rounded-full" /><Block className="h-11 w-24 rounded-full" /></div>
      </div>
      <div className={`${container} py-9 sm:py-12`}>
        <Block className="mb-6 h-8 w-56 sm:h-10" />
        <div className="overflow-hidden rounded-2xl bg-stone-200/80 lg:grid lg:grid-cols-[1.6fr_1fr]">
          <Block className="aspect-video rounded-none bg-stone-300/70" />
          <div className="flex flex-col justify-between gap-8 p-6 sm:p-8 lg:p-9">
            <div><Block className="h-8 w-full bg-stone-300/70" /><Block className="mt-3 h-8 w-4/5 bg-stone-300/70" /><Block className="mt-5 h-3 w-44 bg-stone-300/60" /></div>
            <Block className="h-11 w-40 rounded-full bg-stone-300/70" />
          </div>
        </div>
        <div className="mt-10 sm:mt-12"><VideoGridSkeleton title threeColumns count={6} /></div>
      </div>
    </LoadingFrame>
  );
}

export function WatchLoading() {
  return (
    <LoadingFrame label="Loading teaching…">
      <BreadcrumbSkeleton />
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-20 pt-7 sm:px-8 lg:px-12 lg:pt-10">
        <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-10">
          <div><Block className="aspect-video rounded-2xl sm:rounded-[1.5rem]" /><Block className="mt-5 h-4 w-48" /></div>
          <div className="min-w-0 xl:pt-1">
            <Block className="h-8 w-full" /><Block className="mt-2 h-8 w-3/4" />
            <Block className="mt-4 h-4 w-40" />
            <div className="mt-7 flex gap-2"><Block className="h-11 w-24 rounded-full" /><Block className="h-11 w-24 rounded-full" /></div>
            <div className="mt-7 space-y-2.5"><Block className="h-3 w-full" /><Block className="h-3 w-full" /><Block className="h-3 w-2/3" /></div>
          </div>
        </div>
        <div className="mt-16"><VideoGridSkeleton count={4} /></div>
      </div>
    </LoadingFrame>
  );
}

export function SearchLoading() {
  return (
    <LoadingFrame label="Loading search results…">
      <IntroSkeleton>
        <div className="mt-7 max-w-3xl"><Block className="h-[58px] w-full rounded-xl" /><div className="mt-3 flex gap-2"><Block className="h-11 w-32 rounded-lg" /><Block className="h-11 w-36 rounded-lg" /></div></div>
      </IntroSkeleton>
      <div className={`${container} py-10 sm:py-12`}><VideoGridSkeleton /></div>
    </LoadingFrame>
  );
}

export function CollectionLoading() {
  return (
    <LoadingFrame label="Loading your library…">
      <IntroSkeleton><div className="mt-7 flex gap-2"><Block className="h-11 w-20 rounded-lg" /><Block className="h-11 w-20 rounded-lg" /><Block className="h-11 w-24 rounded-lg" /></div></IntroSkeleton>
      <div className={`${container} py-10 sm:py-12`}><VideoGridSkeleton /></div>
    </LoadingFrame>
  );
}
