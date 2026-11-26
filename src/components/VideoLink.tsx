"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

export default function VideoLink({ href, className, children, onClick }: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const [intendedHref, setIntendedHref] = useState<string>();
  return (
    <Link
      href={href}
      className={className}
      onClick={onClick}
      prefetch={intendedHref === href ? null : false}
      onMouseEnter={() => setIntendedHref(href)}
      onFocus={() => setIntendedHref(href)}
    >
      {children}
    </Link>
  );
}
