'use client'

import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation';


export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={usePathname()} // Keyed on the route for consistent transitions
      initial={{ opacity: 0, rotateY: -105, zIndex: -1, transformOrigin: 'left center' }}
      animate={{ opacity: 1, rotateY: 0, zIndex: 0 }}
      exit={{ opacity: 0, rotateY: 105, zIndex: -1, transformOrigin: 'right center' }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
