import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-[55vh] max-w-2xl flex-col items-center justify-center px-5 py-16 text-center"><h1 className="learning-display text-4xl text-stone-900 sm:text-5xl">Teaching not found</h1><p className="mt-5 max-w-md leading-7 text-stone-600">This teaching may have moved or is no longer available. Find something new to learn in the library.</p><Link href="/topics" className="mt-8 inline-flex min-h-11 items-center rounded-full bg-primary-blue px-6 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-950 motion-reduce:transition-none">Explore topics</Link></main>;
}
