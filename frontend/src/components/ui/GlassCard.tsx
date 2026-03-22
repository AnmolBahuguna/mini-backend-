import type { PropsWithChildren } from 'react'
import clsx from 'clsx'

export interface GlassCardProps extends PropsWithChildren {
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div className={clsx('glass rounded-3xl p-6 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.05]', className)}>
      {children}
    </div>
  )
}

export default GlassCard
