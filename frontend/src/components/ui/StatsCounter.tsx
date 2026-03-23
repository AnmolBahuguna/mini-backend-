import { useInView } from 'react-intersection-observer'
import { useCountUp } from '../../hooks/useCountUp'

interface StatsCounterProps {
  value: number;
  label?: string;
  suffix?: string;
  className?: string; // allow overrides
}

export function StatsCounter({ value, label, suffix = '', className = "text-3xl font-bold text-white" }: StatsCounterProps) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const current = useCountUp(value, 1500, inView)
  const isFloat = Math.abs(current % 1) > 0
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: isFloat ? 1 : 0,
    maximumFractionDigits: isFloat ? 1 : 0,
  }).format(current)

  return (
    <div ref={ref} className="text-center w-full">
      <p className={className}>{formatted}{suffix}</p>
      {label && <p className="mt-2 text-sm uppercase tracking-wide text-gray-400">{label}</p>}
    </div>
  )
}

export default StatsCounter