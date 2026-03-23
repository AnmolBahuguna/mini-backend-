import type { ReactNode } from 'react'
import { Button } from './Button'
import { cn } from '../../lib/utils.ts'

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: {
  title: string
  description?: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-white', className)}>
      {icon ? <div className="text-2xl">{icon}</div> : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? <p className="text-sm text-white/70">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

export default EmptyState
