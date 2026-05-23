import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { alertsApi, type Alert, type AlertFilters } from '../api'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseAlertsReturn {
  alerts: Alert[]
  loading: boolean
  error: string | null
  fetchAlerts: (filters?: AlertFilters) => Promise<void>
  hasNextPage: boolean
  loadMore: () => Promise<void>
}

export function useAlertsAPI(initialFilters?: AlertFilters): UseAlertsReturn {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [filters, setFilters] = useState<AlertFilters>(initialFilters || {})

  const fetchAlerts = useCallback(async (newFilters?: AlertFilters, append = false) => {
    try {
      setLoading(true)
      setError(null)

      const finalFilters = { ...filters, ...newFilters }
      if (newFilters) {
        setFilters(finalFilters)
      }

      const limit = finalFilters.limit || 20
      const offset = append ? alerts.length : 0

      const params = { ...finalFilters, limit, offset }
      const response = await alertsApi.getAlerts(params)
      const data = Array.isArray(response)
        ? response
        : Array.isArray((response as { results?: Alert[] })?.results)
          ? (response as { results: Alert[] }).results
          : []

      if (append) {
        setAlerts((prev: Alert[]) => [...prev, ...data])
      } else {
        setAlerts(data)
      }

      // Check if there are more pages (if we got exactly limit items, assume there might be more)
      setHasNextPage(data.length === limit)

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch alerts'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [filters, alerts.length])

  const loadMore = useCallback(async () => {
    if (!loading && hasNextPage) {
      await fetchAlerts({ ...filters, offset: alerts.length }, true)
    }
  }, [loading, hasNextPage, alerts.length, filters, fetchAlerts])

  useEffect(() => {
    void fetchAlerts()

    // Subscribe to realtime updates
    if (!supabase) return

    const channel: RealtimeChannel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          setAlerts((prev) => [payload.new as Alert, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alerts',
        },
        (payload) => {
          setAlerts((prev) =>
            prev.map((a) => (a.id === payload.new.id ? (payload.new as Alert) : a))
          )
        }
      )
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [fetchAlerts])

  return { 
    alerts, 
    loading, 
    error, 
    fetchAlerts, 
    hasNextPage, 
    loadMore 
  }
}
