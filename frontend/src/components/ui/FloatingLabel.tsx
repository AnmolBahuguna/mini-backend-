import { forwardRef } from 'react'
import clsx from 'clsx'

export interface FloatingLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
  error?: string
  icon?: React.ReactNode
}

export const FloatingLabel = forwardRef<HTMLInputElement, FloatingLabelProps>(function FloatingLabel(
  { id, label, error, icon, className, ...props },
  ref,
) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs uppercase tracking-[0.15em] text-white/50">{label}</label>
      <div className="relative">
        {icon ? <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">{icon}</span> : null}
        <input
          ref={ref}
          id={id}
          className={clsx('input-base', icon ? 'pl-10' : '', className)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
      </div>
      {error ? <p id={`${id}-error`} className="text-xs text-red-400">{error}</p> : null}
    </div>
  )
})

export default FloatingLabel
