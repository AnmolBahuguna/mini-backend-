type Props = {
  value: number
  label: string
  size?: number
}

export function CircularMeter({ value, label, size = 180 }: Props) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(100, value))
  const offset = circumference * (1 - progress / 100)

  const color = progress > 60 ? '#DC2626' : progress > 30 ? '#D97706' : '#059669'

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#374151" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div className="-mt-[112px] text-center">
        <p className="text-4xl font-extrabold text-white">{progress}</p>
        <p className="text-xs text-gray-400">{label}</p>
      </div>
    </div>
  )
}
