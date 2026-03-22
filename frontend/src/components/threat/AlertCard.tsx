import { motion } from 'framer-motion'
import { MapPin, Radar, Users } from 'lucide-react'
import type { AlertRecord } from '../../types/threat'
import { RiskBadge } from '../ui/RiskBadge'

interface AlertCardProps {
  alert: AlertRecord
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-white/10 bg-[#1F2937]/70 p-4 shadow-lg"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-white">{alert.title}</h3>
        <RiskBadge level={alert.severity} />
      </div>
      <p className="text-sm text-gray-300">{alert.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{alert.region}</span>
        <span className="inline-flex items-center gap-1"><Radar className="h-3 w-3" />{alert.time}</span>
        <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{alert.affectedCount}</span>
      </div>
    </motion.article>
  )
}
