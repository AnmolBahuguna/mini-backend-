import type { ReactNode } from 'react'
import { cn } from '../../lib/utils.ts'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info'

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-600/15 text-emerald-300 border border-emerald-500/40',
  warning: 'bg-amber-500/15 text-amber-300 border border-amber-400/40',
  danger: 'bg-red-600/15 text-red-300 border border-red-500/40',
  info: 'bg-blue-600/15 text-blue-200 border border-blue-500/40',
}

export function Badge({ children, variant = 'info', className }: { children: ReactNode; variant?: BadgeVariant; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', variantStyles[variant], className)}>
      {children}
    </span>
  )
}

export default Badge
