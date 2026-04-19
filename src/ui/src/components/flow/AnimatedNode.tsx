import { memo, type ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AnimatedNodeWrapperProps {
  index: number
  children: ReactNode
}

export const AnimatedNodeWrapper = memo(function AnimatedNodeWrapper({
  index,
  children,
}: AnimatedNodeWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
        delay: index * 0.05,
      }}
    >
      {children}
    </motion.div>
  )
})
