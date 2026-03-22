import clsx from 'clsx'
import type { LucideIcon } from 'lucide-react'

type Props = {
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'danger' | 'success' | 'purple'
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
  icon?: LucideIcon
  className?: string
  onClick?: () => void
}

const styles: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-gradient-to-r from-[#0066FF] to-[#8B5CF6] text-white hover:from-blue-500 hover:to-violet-500',
  outline: 'border border-white/20 bg-white/5 text-white hover:border-white/35 hover:bg-white/10',
  danger: 'bg-gradient-to-r from-[#FF0044] to-red-600 text-white hover:brightness-110',
  success: 'bg-gradient-to-r from-[#00FF88] to-emerald-500 text-black hover:brightness-105',
  purple: 'bg-gradient-to-r from-violet-600 to-pink-500 text-white hover:brightness-110',
}

export function GradientButton({
  children,
  variant = 'primary',
  type = 'button',
  loading,
  disabled,
  icon: Icon,
  className,
  onClick,
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        'btn-magnetic shimmer relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-6 py-3 text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60',
        styles[variant],
        className,
      )}
    >
      {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : null}
      {!loading && Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  )
}

export default GradientButton
