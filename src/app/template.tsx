'use client'

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

function TemplateComponent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${pathname}?${searchParams.toString()}`;

  return (
    <motion.div
      key={key} // Keyed on the route for consistent transitions
      initial={{ opacity: 0, rotateY: -105, zIndex: -1, transformOrigin: 'left center' }}
      animate={{ opacity: 1, rotateY: 0, zIndex: 0 }}
      exit={{ opacity: 0, rotateY: 105, zIndex: -1, transformOrigin: 'right center' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
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