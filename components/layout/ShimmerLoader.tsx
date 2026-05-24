interface ShimmerLoaderProps {
  className?: string
}

export function ShimmerLoader({ className = '' }: ShimmerLoaderProps) {
  return (
    <div
      className={`relative overflow-hidden bg-sand/20 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-ivory/60 to-transparent" />
    </div>
  )
}
