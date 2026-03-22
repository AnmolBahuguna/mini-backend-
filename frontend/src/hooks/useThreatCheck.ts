import { useState } from 'react'
import { api } from '../lib/api'

type ThreatCheckResponse = {
  id?: string
  drs_score: number
  risk_level: string
  api_results: unknown
  cached: boolean
  ai_summary?: string
}

export function useThreatCheck() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ThreatCheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (entity: string, entityType: 'url' | 'phone' | 'upi' | 'ip') => {
    setError(null)
    setLoading(true)
    try {
      const response = await api.post('/api/threat-check/', {
        entity,
        entity_type: entityType,
      })
      setData(response.data)

      const threatId = response.data?.id
      if (threatId) {
        const intervalId = window.setInterval(async () => {
          const enrichment = await api.get(`/api/threat-check/${threatId}/enrichment/`)
          if (enrichment.data?.ready) {
            setData((prev) => prev ? { ...prev, ai_summary: enrichment.data.ai_summary } : prev)
            clearInterval(intervalId)
          }
        }, 3000)
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Threat check failed')
      throw requestError
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    score: data?.drs_score ?? null,
    data,
    error,
    analyze,
  }
}
