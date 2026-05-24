'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import type { MemoryPhoto } from '@/types'

interface PhotoGalleryProps {
  photos: MemoryPhoto[]
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  if (photos.length === 0) return null

  return (
    <div className="columns-2 md:columns-3 gap-2">
      {photos.map((photo, i) => (
        <motion.div
          key={photo.id}
          className="break-inside-avoid mb-2 relative overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src={photo.storage_url}
            alt={photo.caption || ''}
            width={400}
            height={300}
            className="w-full h-auto object-cover"
          />
          {photo.caption && (
            <p className="font-cormorant italic text-[11px] text-stone mt-1 px-0.5">
              {photo.caption}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  )
}
