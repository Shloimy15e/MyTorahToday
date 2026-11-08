import { cache, Suspense } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { displayFont, sourceFont } from "@/styles/fonts";
import { BookOpenIcon, PlayIcon, DocumentTextIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { fetchSubtopicServer, getSubtopicLibraryServer } from "@/data/videoData";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Error401 } from "@/components/Error401";
import JournalSection from "@/components/JournalSection";
import SefariaText from "@/components/SefariaText";
import SubtopicVideoLibrary from "@/components/SubtopicVideoLibrary";
import { fetchSourceText } from "@/data/sourceText";

type Props = { params: Promise<{ subtopicId: string }> };

const getSubtopic = cache(async (id: string, authToken: string | null = null) => {
  try {
    return await fetchSubtopicServer(id, authToken);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("HTTP error 404")) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const subtopic = await getSubtopic((await params).subtopicId);
  const title = `${subtopic.name} - My Torah Today`;
  const description = subtopic.description?.trim() || `Explore ${subtopic.name} on My Torah Today.`;
  const url = `https://mytorahtoday.com/subtopics/${subtopic.id}`;
  const images = [{ url: "https://mytorahtoday.com/images/social-preview-v2.png", width: 1200, height: 630, alt: "My Torah Today — Torah teachings with Rabbi Shimon Semp" }];
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "My Torah Today", images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

type SourcePromise = ReturnType<typeof fetchSourceText>;

async function ReadingLink({ source }: { source: SourcePromise }) {
  if (!await source) return null;
  return <a href="#read" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium hover:border-primary-blue hover:text-primary-blue"><BookOpenIcon className="h-4 w-4" aria-hidden="true" />Read</a>;
}

async function ReadingSection({ source, name }: { source: SourcePromise; name: string }) {
  const reading = await source;
  if (!reading) return null;
  return <section id="read" aria-labelledby="reading-heading" className="scroll-mt-28 pt-4">
    <div className="mb-6 max-w-2xl">
      <h2 id="reading-heading" className="learning-display text-3xl tracking-tight sm:text-4xl">Read & explore</h2>
      <p className="mt-3 leading-relaxed text-stone-600">Source reading for {name}, provided by Sefaria.</p>
    </div>
    <SefariaText text={reading.text} title={reading.title} sourceUrl={reading.sourceUrl} sections={reading.sections} direction={reading.direction} language={reading.language} readerClassName={`${displayFont.variable} ${sourceFont.variable}`} />
  </section>;
}

async function EmptyMaterials({ source }: { source: SourcePromise }) {
  if (await source) return null;
  return <p className="py-12 text-center text-stone-600">There are no teachings or reading materials for this subject yet. Explore another subject below.</p>;
}

export default async function SubtopicPage(props: Props) {
  try {
    return await SubtopicLearningPage(props);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("HTTP error 401")) return <Error401 />;
    throw error;
  }
}

async function SubtopicLearningPage({ params }: Props) {
  const { subtopicId } = await params;
  const authToken = (await cookies()).get("auth_token")?.value || null;
  const subtopic = await getSubtopic(subtopicId, authToken);
  const source = fetchSourceText(subtopic);
  const videos = await getSubtopicLibraryServer(subtopicId, authToken);
  const featured = videos.find((video) => video.id === subtopic.featured_video) || subtopic.featured_video_data || null;
  const hasVideos = videos.length > 0 || !!featured;
  const journals = subtopic.journals || [];
  return (
    <main className={`${displayFont.variable} ${sourceFont.variable} subtopic-learning min-h-screen bg-stone-50 text-stone-900 selection:bg-blue-100 selection:text-blue-950`}>
      <Breadcrumbs segments={[
        { href: "topics", label: "Topics" },
        { href: `topics/${subtopic.topic}`, label: subtopic.topic_name },
        { href: `subtopics/${subtopic.id}`, label: subtopic.name },
      ]} />
      <header className="bg-stone-50">
        <div className="mx-auto max-w-7xl px-5 pb-2 pt-8 sm:px-8 sm:pt-10 lg:px-12">
          <div className="max-w-3xl pb-7 sm:pb-8">
            <h1 className="learning-display text-balance text-5xl leading-[1.05] tracking-tight text-primary-blue sm:text-7xl">{subtopic.name}</h1>
            {subtopic.description?.trim() && <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-relaxed text-stone-600 sm:text-lg">{subtopic.description}</p>}
          </div>
          <Suspense fallback={null}>
          <LearningNavigation hasVideos={hasVideos} source={source} hasJournals={journals.length > 0} />
          </Suspense>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-5 py-9 sm:px-8 sm:py-12 lg:px-12">
        {hasVideos && <SubtopicVideoLibrary key={subtopic.id} videos={videos} featured={featured} />}
        <Suspense fallback={<p role="status" className="text-sm text-stone-600">Loading source reading…</p>}>
          <ReadingSection source={source} name={subtopic.name} />
        </Suspense>
        {journals.length > 0 && <JournalSection journals={journals} />}
        {!hasVideos && journals.length === 0 && <Suspense fallback={null}><EmptyMaterials source={source} /></Suspense>}
        <Link href={`/topics/${subtopic.topic}`} className="inline-flex min-h-11 w-fit items-center gap-2 font-medium text-primary-blue underline-offset-4 hover:underline"><ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />Explore {subtopic.topic_name}</Link>
      </div>
    </main>
  );
}

async function LearningNavigation({ hasVideos, hasJournals, source }: { hasVideos: boolean; hasJournals: boolean; source: SourcePromise }) {
  if (!hasVideos && !hasJournals && !await source) return null;
  return (
            <nav aria-label="Learning sections" className="flex flex-wrap gap-2 pb-5 sm:gap-4">
              {hasVideos && <a href="#watch" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-blue px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-950"><PlayIcon className="h-4 w-4" aria-hidden="true" />Watch</a>}
              <Suspense fallback={null}><ReadingLink source={source} /></Suspense>
              {hasJournals && <a href="#journal" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-medium hover:border-primary-blue hover:text-primary-blue"><DocumentTextIcon className="h-4 w-4" aria-hidden="true" />Journal</a>}
            </nav>
  );
}
