import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils.ts'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-500 border border-blue-500/50 shadow-[0_10px_30px_rgba(37,99,235,0.25)]',
  secondary: 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
  danger: 'bg-red-600 text-white hover:bg-red-500 border border-red-500/60',
  ghost: 'bg-transparent text-white hover:bg-white/10 border border-white/20',
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  loading?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  fullWidth?: boolean
}

export function Button({
  children,
  className,
  variant = 'primary',
  loading = false,
  disabled,
  iconLeft,
  iconRight,
  fullWidth,
  ...rest
}: ButtonProps) {
  const showSpinner = loading

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1e]',
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        loading || disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer',
        className,
      )}
      disabled={disabled || loading}
      aria-busy={loading}
      data-loading={loading ? 'true' : 'false'}
      {...rest}
    >
      {iconLeft ? <span className="inline-flex items-center">{iconLeft}</span> : null}
      {showSpinner ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden />
          <span>Loading…</span>
        </span>
      ) : (
        children
      )}
      {iconRight ? <span className="inline-flex items-center">{iconRight}</span> : null}
    </button>
  )
}

export default Button
