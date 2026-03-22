import { useCountUp } from '../../hooks/useCountUp'

export function StatsCounter({ value, label }: { value: number; label: string }) {
  const current = useCountUp(value, 1500)

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800/30 p-6 text-center">
      <p className="text-3xl font-bold text-white">{current.toLocaleString()}+</p>
      <p className="mt-2 text-sm uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  )
}
