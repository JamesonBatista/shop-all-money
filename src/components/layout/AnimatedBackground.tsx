import { motion } from 'framer-motion'
import './layout.css'

export function AnimatedBackground() {
  return (
    <div className="bs-bg" aria-hidden="true">
      <div className="bs-bg__gradient" />
      <motion.div
        className="bs-bg__orb bs-bg__orb--a"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="bs-bg__orb bs-bg__orb--b"
        animate={{ x: [0, -50, 30, 0], y: [0, 40, -25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="bs-bg__grid" />
    </div>
  )
}
