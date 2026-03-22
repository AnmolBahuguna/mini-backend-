import { Clock, MapPin, Users } from 'lucide-react'
import type { AlertRecord } from '../../types/threat'
import { RiskBadge } from '../ui/RiskBadge'

export function AlertItem({ alert }: { alert: AlertRecord }) {
  return (
    <article className="card relative">
      <div className="absolute right-6 top-6">
        <RiskBadge level={alert.severity} />
      </div>
      <h3 className="pr-20 text-lg font-bold text-white">{alert.title}</h3>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {alert.region}</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {alert.time}</span>
      </div>
      <p className="mt-3 text-sm text-gray-300">{alert.description}</p>
      <p className="mt-3 inline-flex items-center gap-1 text-xs text-orange-300">
        <Users className="h-3 w-3" /> {alert.affectedCount} users affected
      </p>
      <div className="mt-4 flex gap-2">
        <button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Report Similar</button>
        <button className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white">Check This Threat</button>
      </div>
    </article>
  )
}
