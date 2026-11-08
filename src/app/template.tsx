"use client";

import { Suspense } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";

function TemplateComponent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${pathname}?${searchParams.toString()}`;
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={key}
      initial={{ opacity: reduceMotion ? 1 : 0.6, y: reduceMotion ? 0 : 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <TemplateComponent>{children}</TemplateComponent>
    </Suspense>
  );
}
