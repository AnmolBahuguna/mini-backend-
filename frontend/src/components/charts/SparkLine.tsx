import { Line, LineChart, ResponsiveContainer } from 'recharts'
import { LoadingSkeleton } from '../ui/LoadingSkeleton'

type Props = {
  data: Array<{ value: number }>
}

export function SparkLine({ data }: Props) {
  if (!data || data.length === 0) {
    return <LoadingSkeleton rows={2} className="h-16 w-full" />
  }

  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
