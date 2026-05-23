import { useEffect, useRef, useState } from 'react'
import { api } from '../lib/api'

type ThreatCheckResponse = {
  id?: string
  drs_score: number
  risk_level: string
  api_results: Record<string, unknown> | null
  cached: boolean
  ai_summary?: string
}

type ThreatEnrichment = {
  ready?: boolean
  ai_summary?: string
}

export function useThreatCheck() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ThreatCheckResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<number | null>(null)

  const analyze = async (entity: string, entityType: 'url' | 'domain' | 'phone' | 'email' | 'upi' | 'ip') => {
    setError(null)
    setLoading(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    try {
      const response = await api.post<ThreatCheckResponse>('/api/threat-check/', {
        entity,
        entity_type: entityType,
      })
      setData(response.data)

      const threatId = response.data?.id
      if (threatId) {
        const intervalId = window.setInterval(async () => {
          const enrichment = await api.get<ThreatEnrichment>(`/api/threat-check/${threatId}/enrichment/`)
          if (enrichment.data?.ready) {
            setData((prev) => prev ? { ...prev, ai_summary: enrichment.data.ai_summary } : prev)
            clearInterval(intervalId)
            intervalRef.current = null
          }
        }, 3000)
        intervalRef.current = intervalId
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Threat check failed')
      throw requestError
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  return {
    loading,
    score: data?.drs_score ?? null,
    data,
    error,
    analyze,
  }
}
