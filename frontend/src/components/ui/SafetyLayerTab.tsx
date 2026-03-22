type Props = {
  layer: 1 | 2 | 3
  active: boolean
  onClick: () => void
}

const labels: Record<1 | 2 | 3, string> = {
  1: 'Layer 1 · Report Abuse',
  2: 'Layer 2 · AI Chatbot',
  3: 'Layer 3 · Safety Planner',
}

export function SafetyLayerTab({ layer, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={active ? 'rounded-xl bg-violet-600 px-4 py-3 text-white' : 'rounded-xl bg-gray-700 px-4 py-3 text-gray-300'}
    >
      {labels[layer]}
    </button>
  )
}
