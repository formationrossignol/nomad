import React from 'react'

interface EditorialFieldProps {
  label: string
  children: React.ReactNode
}

export function EditorialField({ label, children }: EditorialFieldProps) {
  return (
    <div className="py-8 border-b border-sand/40 last:border-0">
      <label className="block font-inter text-[8px] tracking-[0.22em] uppercase text-stone mb-4">
        {label}
      </label>
      {children}
    </div>
  )
}

export const editorialInputClass =
  'w-full bg-transparent border-0 border-b border-sand focus:border-deep-blue focus:outline-none font-cormorant text-[24px] italic text-deep-blue placeholder:text-stone/40 pb-2 transition-colors duration-200'

export const editorialTextareaClass =
  'w-full bg-transparent border-0 border-b border-sand focus:border-deep-blue focus:outline-none font-cormorant text-[18px] text-midnight/80 leading-[1.8] placeholder:text-stone/40 pb-2 resize-none transition-colors duration-200'
