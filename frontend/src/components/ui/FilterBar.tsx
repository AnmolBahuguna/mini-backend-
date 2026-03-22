type Filter = {
  label: string
  options: string[]
  value: string
}

type Props = {
  filters: Filter[]
  onChange: (label: string, value: string) => void
}

export function FilterBar({ filters, onChange }: Props) {
  return (
    <div className="card overflow-x-auto">
      <div className="flex min-w-[720px] gap-3">
        {filters.map((filter) => (
          <label key={filter.label} className="min-w-40">
            <span className="mb-1 block text-xs uppercase tracking-wide text-gray-400">{filter.label}</span>
            <select
              className="input-base"
              value={filter.value}
              onChange={(event) => onChange(filter.label, event.target.value)}
            >
              {filter.options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  )
}
