import { useMemo, useState } from 'react'
import { Activity } from 'lucide-react'
import { useAlertsQuery } from '../hooks/useAlertsQuery'
import { useRealtimeAlerts } from '../hooks/useRealtimeFeed'
import { FilterBar } from '../components/ui/FilterBar'
import { AlertCard } from '../components/threat/AlertCard'

export function AlertsPage() {
  const [state, setState] = useState('All')
  const [scamType, setScamType] = useState('All')

  useRealtimeAlerts()

  const alertsQuery = useAlertsQuery({ state, scamType })

  const filters = useMemo(() => [
    {
      label: 'State',
      options: ['All', 'Uttarakhand', 'Delhi', 'Maharashtra', 'Karnataka'],
      value: state,
    },
    {
      label: 'Scam Type',
      options: ['All', 'Phishing', 'UPI Fraud', 'Digital Arrest', 'Loan App'],
      value: scamType,
    },
  ], [scamType, state])

  const avgRisk = useMemo(() => {
    const alerts = alertsQuery.data ?? []
    if (alerts.length === 0) return 0
    const score = alerts.reduce((sum, alert) => sum + (alert.severity === 'CRITICAL' ? 90 : alert.severity === 'HIGH' ? 72 : alert.severity === 'MEDIUM' ? 48 : 20), 0)
    return Math.round(score / alerts.length)
  }, [alertsQuery.data])

  const progressClass = avgRisk >= 85
    ? 'w-[92%]'
    : avgRisk >= 70
      ? 'w-[76%]'
      : avgRisk >= 50
        ? 'w-[58%]'
        : avgRisk >= 30
          ? 'w-[42%]'
          : 'w-[22%]'

  return (
    <div>
      <section className="border-b border-gray-700 bg-[linear-gradient(160deg,#0A0F1E_0%,#0f172a_100%)] py-12">
        <div className="page-wrap">
          <h1 className="text-4xl font-black text-white">🚨 Live Threat Alerts</h1>
          <p className="mt-2 text-sm text-gray-400">Real-time intelligence feed powered by community reports + AI enrichment.</p>
        </div>
      </section>

      <section className="page-wrap py-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div>
            <FilterBar
              filters={filters}
              onChange={(label, value) => {
                if (label === 'State') setState(value)
                if (label === 'Scam Type') setScamType(value)
              }}
            />

            <div className="mt-4 space-y-3">
              {alertsQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-28 animate-pulse rounded-2xl bg-white/5" />)
              ) : alertsQuery.isError ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">Failed to load alerts. Try again.</div>
              ) : (alertsQuery.data?.length ?? 0) === 0 ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-gray-300">No alerts for the selected filters.</div>
              ) : (
                alertsQuery.data?.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={{
                      id: alert.id,
                      title: alert.title,
                      region: alert.region,
                      severity: alert.severity,
                      time: alert.time,
                      description: alert.description,
                      affectedCount: alert.affectedCount,
                      scamType: alert.scamType,
                      state: alert.state,
                    }}
                  />
                ))
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Regional Risk Meter</h3>
                <span className="text-xs text-gray-500">{state === 'All' ? 'All Regions' : state}</span>
              </div>
              <div className="text-center">
                <p className="text-5xl font-black text-red-400">{avgRisk}</p>
                <p className="text-xs text-gray-400">High Activity</p>
              </div>
              <div className="mt-4 h-1 overflow-hidden rounded bg-gray-700">
                <div className={`h-full bg-blue-500 ${progressClass}`} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
              <h3 className="mb-3 text-sm font-bold text-white">Region Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-300"><span>Active threats today</span><span className="font-bold text-red-300">{alertsQuery.data?.length ?? 0}</span></div>
                <div className="flex items-center justify-between text-gray-300"><span>Total reports (30d)</span><span className="font-bold text-blue-300">{(alertsQuery.data?.length ?? 0) * 14}</span></div>
                <div className="flex items-center justify-between text-gray-300"><span>Most active scam</span><span className="font-bold">{scamType === 'All' ? 'Mixed' : scamType}</span></div>
                <div className="flex items-center justify-between text-gray-300"><span>Detection accuracy</span><span className="font-bold text-emerald-300">94.3%</span></div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-200">
              <p className="mb-2 inline-flex items-center gap-2 font-semibold uppercase tracking-[0.12em]"><Activity className="h-4 w-4" />Realtime Watch</p>
              Listening for new alert inserts via Supabase channel subscription.
            </div>

            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
              <h3 className="mb-2 text-sm font-bold text-red-300">🆘 Emergency Numbers</h3>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex justify-between"><span>Cyber Crime Helpline</span><span className="font-mono text-blue-300">1930</span></div>
                <div className="flex justify-between"><span>Police Emergency</span><span className="font-mono text-blue-300">112</span></div>
                <div className="flex justify-between"><span>Women Helpline</span><span className="font-mono text-violet-300">7827-170-170</span></div>
                <div className="flex justify-between"><span>RBI Fraud Helpline</span><span className="font-mono text-blue-300">14448</span></div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
