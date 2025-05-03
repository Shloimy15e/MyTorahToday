"use client";

import { ChevronRightIcon, HomeIcon } from "@heroicons/react/20/solid";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs({
    segments
}: {
    segments: {
        href: string,
        label: string,
    }[]
}) {
  const pathname = usePathname();
  
  // Skip breadcrumbs for home page
  if (pathname === "/") return null;

  
  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segment.href}`;
    const label = segment.label
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    
    return {
      href,
      label,
      current: index === segments.length - 1
    };
  }).filter(breadcrumb => breadcrumb.label !== "Videos");

  return (
    <nav className="flex px-4 py-3 bg-white shadow-sm" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/"
            className="text-gray-500 hover:text-gray-700 flex items-center"
          >
            <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb) => (
          <li key={breadcrumb.href} className="flex items-center">
            <ChevronRightIcon
              className="h-5 w-5 flex-shrink-0 text-gray-400"
              aria-hidden="true"
            />
            {breadcrumb.current ? (
              <span
                className="ml-2 text-sm font-medium text-gray-500"
                aria-current="page"
              >
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
} 