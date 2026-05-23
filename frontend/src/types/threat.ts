export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERIFIED' | 'CRITICAL' | 'UNKNOWN'

export type ThreatReport = {
  id: string
  title: string
  region: string
  timeAgo: string
  description: string
  similarCount: number
  level: RiskLevel
  verified?: boolean
}

export type AlertRecord = {
  id: string
  title: string
  region: string
  severity: RiskLevel
  time: string
  description: string
  affectedCount: number
  scamType?: string
  state?: string
}

export type PanicState = 'idle' | 'requesting' | 'sending' | 'sent'
