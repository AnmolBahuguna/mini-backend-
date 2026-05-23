import type { RiskLevel } from './threat'

export interface DashboardStatsResponse {
  threatsDetected: number
  activeAlerts: number
  protectedUsers: number
  detectionAccuracy: number
}

export interface ThreatCheckRequest {
  entity: string
  entity_type: 'url' | 'domain' | 'phone' | 'email' | 'upi' | 'ip' | 'message'
}

export interface ThreatCheckResponse {
  id: string
  drs_score: number
  risk_level: RiskLevel
  scam_type: string
  reports_count: number
  geo_tags: string[]
  entity: string
  entity_type: ThreatCheckRequest['entity_type']
  api_results?: Record<string, string>
  ai_summary?: string
  status?: 'pending' | 'completed' | 'error'
}

export interface AlertsResponse {
  results: AlertApiRecord[]
}

export interface AlertApiRecord {
  id: string
  title: string
  region: string
  severity: RiskLevel
  time: string
  description: string
  affectedCount: number
  scamType: string
  state: string
}

export interface ReportsResponse {
  results: CommunityReport[]
  next: string | null
}

export interface CommunityReport {
  id: string
  title: string
  entity: string
  scamType: string
  description: string
  region: string
  severity: RiskLevel
  timeAgo: string
  similarCount: number
}

export interface CreateReportRequest {
  entity: string
  entity_type?: ThreatCheckRequest['entity_type']
  scamType: string
  description: string
  state?: string
  victimCount?: number
  anonymous?: boolean
  reporterName?: string
  reporterEmail?: string
}

export type CreateReportResponse = CommunityReport & { success?: boolean; report_id?: string }
