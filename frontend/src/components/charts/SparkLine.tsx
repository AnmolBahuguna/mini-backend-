import { Line, LineChart, ResponsiveContainer } from 'recharts'

type Props = {
  data: Array<{ value: number }>
}

export function SparkLine({ data }: Props) {
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
