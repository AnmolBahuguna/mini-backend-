import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useRealtimeAlerts() {
  const queryClient = useQueryClient()
  const isTest = import.meta.env.MODE === 'test'
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (isTest) return
    
    const client = supabase
    if (!client) return

    // Clean up previous channel if exists
    if (channelRef.current) {
      try {
        void client.removeChannel(channelRef.current)
      } catch (error) {
        console.warn('Failed to remove previous alerts channel:', error)
      }
      channelRef.current = null
    }

    try {
      const channel = client
        .channel('alerts-feed')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'alerts' 
          }, 
          () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] })
          }
        )
        .subscribe(() => {})

      channelRef.current = channel
    } catch {
      // no-op: live feed setup failures should not break UI rendering
    }

    return () => {
      if (channelRef.current) {
        try {
          void client.removeChannel(channelRef.current)
        } catch (error) {
          console.warn('Failed to remove alerts channel on cleanup:', error)
        }
        channelRef.current = null
      }
    }
  }, [isTest, queryClient])
}

export function useRealtimeReports() {
  const queryClient = useQueryClient()
  const isTest = import.meta.env.MODE === 'test'
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (isTest) return
    
    const client = supabase
    if (!client) return

    // Clean up previous channel if exists
    if (channelRef.current) {
      try {
        void client.removeChannel(channelRef.current)
      } catch (error) {
        console.warn('Failed to remove previous reports channel:', error)
      }
      channelRef.current = null
    }

    try {
      const channel = client
        .channel('reports-feed')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'threat_reports' 
          }, 
          () => {
            queryClient.invalidateQueries({ queryKey: ['reports'] })
          }
        )
        .subscribe(() => {})

      channelRef.current = channel
    } catch {
      // no-op: live feed setup failures should not break UI rendering
    }

    return () => {
      if (channelRef.current) {
        try {
          void client.removeChannel(channelRef.current)
        } catch (error) {
          console.warn('Failed to remove reports channel on cleanup:', error)
        }
        channelRef.current = null
      }
    }
  }, [isTest, queryClient])
}
