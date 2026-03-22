import clsx from 'clsx'
import type { RiskLevel } from '../../types/threat'

const colorByLevel: Record<RiskLevel, string> = {
  LOW: 'bg-gray-600 text-gray-100',
  MEDIUM: 'bg-amber-600 text-white',
  HIGH: 'bg-red-600 text-white',
  VERIFIED: 'bg-emerald-600 text-white',
  CRITICAL: 'bg-red-700 text-white',
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wide',
        colorByLevel[level],
      )}
    >
      {level}
    </span>
  )
}
