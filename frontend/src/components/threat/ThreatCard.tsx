import { MapPin } from 'lucide-react'
import { RiskBadge } from '../ui/RiskBadge'
import type { ThreatReport } from '../../types/threat'

export function ThreatCard({ report }: { report: ThreatReport }) {
  return (
    <article className="card transition-all duration-200 hover:scale-[1.02] hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-white">{report.title}</h3>
        <RiskBadge level={report.level} />
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-300">{report.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {report.region}</span>
        <span>{report.timeAgo}</span>
      </div>
      <p className="mt-2 text-xs text-amber-300">{report.similarCount} similar reports</p>
    </article>
  )
}
