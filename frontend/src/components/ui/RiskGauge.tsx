type Props = {
  score: number
}

export function RiskGauge({ score }: Props) {
  const clamped = Math.max(0, Math.min(10, score))
  const pct = clamped / 10
  const color = clamped <= 3 ? '#059669' : clamped <= 6 ? '#D97706' : '#DC2626'

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="130" viewBox="0 0 220 130">
        <path d="M20,110 A90,90 0 0,1 200,110" fill="none" stroke="#374151" strokeWidth="12" />
        <path
          d="M20,110 A90,90 0 0,1 200,110"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray="283"
          strokeDashoffset={283 * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div className="-mt-6 text-center">
        <p className="text-5xl font-extrabold" style={{ color }}>{clamped.toFixed(1)}</p>
        <p className="text-sm text-gray-400">Digital Risk Score</p>
      </div>
    </div>
  )
}
