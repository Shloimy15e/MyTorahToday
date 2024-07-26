'use client'

import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90, transformOrigin: "right" }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 1.2, type: 'spring', damping: 8, stiffness: 60 }}
    >
      {children}
    </motion.div>
  )
}
