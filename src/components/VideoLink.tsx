"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

export default function VideoLink({ href, className, children }: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const [intendedHref, setIntendedHref] = useState<string>();
  return (
    <Link
      href={href}
      className={className}
      prefetch={intendedHref === href ? null : false}
      onMouseEnter={() => setIntendedHref(href)}
      onFocus={() => setIntendedHref(href)}
    >
      {children}
    </Link>
  );
}
