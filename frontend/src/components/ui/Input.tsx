import type { InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cn } from '../../lib/utils.ts'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, helperText, leftIcon, className, ...rest }, ref) => {
  return (
    <label className="block space-y-1 text-sm text-white/80">
      {label ? <span className="text-xs uppercase tracking-[0.14em] text-white/50">{label}</span> : null}
      <div className={cn('relative flex items-center rounded-xl border border-white/15 bg-[#111827] px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400', error ? 'border-red-500/60 ring-red-500/40' : '', className)}>
        {leftIcon ? <span className="mr-2 inline-flex text-white/50">{leftIcon}</span> : null}
        <input
          ref={ref}
          className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          {...rest}
        />
      </div>
      {error ? <span className="text-xs text-red-400">{error}</span> : helperText ? <span className="text-xs text-white/50">{helperText}</span> : null}
    </label>
  )
})

Input.displayName = 'Input'

export default Input
