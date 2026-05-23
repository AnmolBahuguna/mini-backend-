type Props = {
  score: number
}

export function RiskGauge({ score }: Props) {
  // Parse score to ensure it's a number (fix for "gauge stuck at 0")
  const parsedScore = parseFloat(String(score)) || 0
  const clamped = Math.max(0, Math.min(10, parsedScore))
  const pct = clamped / 10
  const color = clamped <= 3 ? '#059669' : clamped <= 6 ? '#D97706' : '#DC2626'
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - pct * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="220" viewBox="0 0 220 220">
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeLinecap="round"
          transform="rotate(-90 110 110)"
        />
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 110 110)"
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div className="-mt-16 text-center">
        <p className="text-5xl font-extrabold" style={{ color }}>{clamped.toFixed(1)}</p>
        <p className="text-sm text-gray-400">Digital Risk Score</p>
      </div>
    </div>
  )
}
