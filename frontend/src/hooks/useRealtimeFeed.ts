import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useRealtimeAlerts() {
  const queryClient = useQueryClient()
  const isTest = import.meta.env.MODE === 'test'

  useEffect(() => {
    if (isTest) return
    const client = supabase
    if (!client) return

    const channel = client
      .channel('alerts-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['alerts'] })
      })
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [isTest, queryClient])
}

export function useRealtimeReports() {
  const queryClient = useQueryClient()
  const isTest = import.meta.env.MODE === 'test'

  useEffect(() => {
    if (isTest) return
    const client = supabase
    if (!client) return

    const channel = client
      .channel('reports-feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, () => {
        queryClient.invalidateQueries({ queryKey: ['reports'] })
      })
      .subscribe()

    return () => {
      void client.removeChannel(channel)
    }
  }, [isTest, queryClient])
}
