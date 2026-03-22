import { Bar, BarChart as ReBarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

type Props = {
  data: Array<{ name: string; value: number }>
}

export function BarChart({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data}>
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  )
}
