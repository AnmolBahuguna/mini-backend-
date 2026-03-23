import { cn } from '../../lib/utils.ts'

export function LoadingSkeleton({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)} role="status" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="h-4 w-full animate-pulse rounded bg-white/10" />
      ))}
    </div>
  )
}

export function CardSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <LoadingSkeleton rows={lines} />
    </div>
  )
}

export default LoadingSkeleton
