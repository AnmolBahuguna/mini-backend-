import type { ReactNode } from 'react'
import { Button } from './Button'
import { cn } from '../../lib/utils.ts'

export function ErrorState({
  title = 'Something went wrong',
  description,
  icon,
  retry,
  className,
}: {
  title?: string
  description?: string
  icon?: ReactNode
  retry?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center text-white', className)}>
      {icon ? <div className="text-2xl">{icon}</div> : null}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description ? <p className="text-sm text-red-200">{description}</p> : null}
      {retry ? (
        <Button variant="danger" onClick={retry}>
          Retry
        </Button>
      ) : null}
    </div>
  )
}

export default ErrorState
