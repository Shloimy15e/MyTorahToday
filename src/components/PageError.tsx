"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";

export default function PageError({ error, reset }: {
  error?: Error & { digest?: string };
  reset: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  useEffect(() => { if (error) console.error(error); }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl flex-col justify-center px-5 py-16 sm:px-8 lg:px-12">
      <h1 className="learning-display max-w-2xl text-4xl leading-tight tracking-tight text-stone-900 sm:text-5xl">This page couldn&apos;t load.</h1>
      <p className="mt-5 max-w-lg text-base leading-relaxed text-stone-600">Try again in a moment, or explore another topic.</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button type="button" disabled={isPending} aria-busy={isPending} onClick={() => startTransition(reset)} className="min-h-12 rounded-full bg-primary-blue px-6 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue disabled:cursor-wait disabled:opacity-60">{isPending ? "Trying again…" : "Try again"}</button>
        <Link href="/topics" className="inline-flex min-h-12 items-center rounded-full px-6 py-3 text-sm font-medium text-primary-blue underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">Browse topics</Link>
      </div>
    </main>
  );
}
