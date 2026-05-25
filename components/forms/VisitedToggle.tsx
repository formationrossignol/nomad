'use client'
import { motion } from 'framer-motion'

interface VisitedToggleProps {
  isVisited: boolean
  onToggle: () => void
}

export function VisitedToggle({ isVisited, onToggle }: VisitedToggleProps) {
  return (
    <motion.button
      onClick={onToggle}
      aria-pressed={isVisited}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center gap-3 px-5 py-2.5 border transition-all duration-300 font-inter text-[9px] tracking-[0.18em] uppercase ${
        isVisited
          ? 'bg-deep-blue border-deep-blue text-ivory shadow-[0_0_16px_rgba(22,58,112,0.25)]'
          : 'bg-white border-sand text-stone hover:border-deep-blue hover:text-deep-blue'
      }`}
    >
      {isVisited ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Visité
        </>
      ) : (
        'Marquer comme visité'
      )}
    </motion.button>
  )
}
