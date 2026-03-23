import clsx from 'clsx'

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'VERIFIED'

const colorByLevel: Record<RiskLevel, string> = {
  LOW: 'bg-gray-600 text-white',
  MEDIUM: 'bg-amber-600 text-white',
  HIGH: 'bg-red-600 text-white',
  VERIFIED: 'bg-emerald-600 text-white',
  CRITICAL: 'bg-red-700 text-white',
}

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-bold uppercase tracking-wide',
        colorByLevel[level] || 'bg-gray-600 text-white',
        size === 'sm' && 'px-2 py-0.5 text-[10px]',
        size === 'md' && 'px-3 py-1 text-xs',
        size === 'lg' && 'px-4 py-1.5 text-sm lg:text-base'
      )}
    >
      {level}
    </span>
  )
}