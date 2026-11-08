"use client";

import { ArrowLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs({ segments }: { segments: { href: string; label: string }[] }) {
  const pathname = usePathname();
  if (pathname === "/" || !segments.length) return null;
  const breadcrumbs = segments.map(segment => ({ ...segment, href: `/${segment.href.replace(/^\/+/, "")}` }));
  const parent = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : { href: "/", label: "Home" };
  return (
    <nav aria-label="Breadcrumb" className="mx-auto w-full max-w-7xl px-5 pt-5 text-sm sm:px-8 sm:pt-6 lg:px-12">
      <Link href={parent.href} className="inline-flex min-h-11 items-center gap-2 rounded text-stone-600 transition-colors hover:text-primary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue sm:hidden"><ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />{parent.label}</Link>
      <ol className="hidden min-h-8 flex-wrap items-center gap-x-2 gap-y-1 text-stone-500 sm:flex">
        <li><Link href="/" className="inline-flex min-h-8 items-center rounded underline-offset-4 hover:text-primary-blue hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">Home</Link></li>
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex min-w-0 items-center gap-2">
            <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-stone-400" aria-hidden="true" />
            {index === breadcrumbs.length - 1 ? <span aria-current="page" className="font-medium text-stone-700">{breadcrumb.label}</span> : <Link href={breadcrumb.href} className="inline-flex min-h-8 items-center rounded underline-offset-4 hover:text-primary-blue hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">{breadcrumb.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
