import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCountUp } from '../../hooks/useCountUp'

const chartData = [
  { month: 'Jan', threats: 320 },
  { month: 'Feb', threats: 460 },
  { month: 'Mar', threats: 550 },
  { month: 'Apr', threats: 620 },
  { month: 'May', threats: 700 },
  { month: 'Jun', threats: 860 },
  { month: 'Jul', threats: 930 },
  { month: 'Aug', threats: 980 },
  { month: 'Sep', threats: 1020 },
  { month: 'Oct', threats: 1150 },
  { month: 'Nov', threats: 1230 },
  { month: 'Dec', threats: 1320 },
]

function StatTile({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const current = useCountUp(target, 2000)

  return (
    <div className="rounded-2xl border border-sky-400/20 bg-[#0d1526]/85 p-5 shadow-sm">
      <div className="mb-2 h-[2px] w-16 bg-gradient-to-r from-blue-500 to-violet-500" />
      <p className="gradient-text text-[clamp(40px,6vw,80px)] font-black leading-none">
        {current.toLocaleString()}{suffix}
      </p>
      <p className="mt-2 text-xs uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  )
}

export function StatsSection() {
  return (
    <section className="relative bg-gradient-to-b from-transparent via-sky-900/10 to-transparent py-16">
      <div className="page-wrap grid gap-6 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <StatTile target={847} suffix="%" label="Surge Blocked" />
          <StatTile target={120} suffix="Cr" label="Fraud Prevented" />
          <StatTile target={94} suffix="%" label="Detection Accuracy" />
          <StatTile target={50000} suffix="+" label="Protected Users" />
        </div>

        <div className="rounded-2xl border border-sky-400/20 bg-[#0d1526]/90 p-4 shadow-sm">
          <p className="mb-3 text-sm text-slate-300">Threats Detected (12 months)</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0066FF" stopOpacity={0.75} />
                    <stop offset="100%" stopColor="#0066FF" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="rgba(148,163,184,0.6)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(148,163,184,0.6)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(13,21,38,0.95)', border: '1px solid rgba(56,189,248,0.25)', borderRadius: '12px', color: '#e2e8f0' }} />
                <Area type="monotone" dataKey="threats" stroke="#0066FF" strokeWidth={3} fill="url(#threatGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}

export default StatsSection
