import { PhotoGallery } from './PhotoGallery'
import type { Memory } from '@/types'

interface MemoryBlockProps {
  memory: Memory
}

export function MemoryBlock({ memory }: MemoryBlockProps) {
  const date = new Date(memory.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <article className="py-12 border-b border-sand/40 last:border-0">
      <div className="flex items-start gap-12">
        {/* Date column */}
        <div className="w-24 flex-shrink-0 pt-1">
          <p className="font-inter text-[8px] tracking-[0.15em] uppercase text-stone leading-relaxed">
            {date}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {memory.location_name && (
            <p className="font-inter text-[8px] tracking-[0.2em] uppercase text-stone mb-3">
              {memory.location_name}
            </p>
          )}
          {memory.title && (
            <h3 className="font-cormorant italic text-[24px] text-deep-blue leading-tight mb-4">
              {memory.title}
            </h3>
          )}
          {memory.body && (
            <p className="font-cormorant text-[17px] text-midnight/80 leading-[1.8] mb-6">
              {memory.body}
            </p>
          )}
          {memory.memory_photos && memory.memory_photos.length > 0 && (
            <div className="mt-6">
              <PhotoGallery photos={memory.memory_photos} />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
