import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { AlertApiRecord, AlertsResponse } from '../types/api'

interface AlertsFilters {
  state: string
  scamType: string
}

// Input validation
function validateFilters(filters: AlertsFilters): void {
  if (filters.state && typeof filters.state !== 'string') {
    throw new Error('State filter must be a string')
  }
  if (filters.scamType && typeof filters.scamType !== 'string') {
    throw new Error('Scam type filter must be a string')
  }
}

export function useAlertsQuery(filters: AlertsFilters) {
  const normalize = (value: string) => {
    if (!value || typeof value !== 'string') return undefined
    const trimmed = value.trim()
    return trimmed.toLowerCase().startsWith('all') ? undefined : trimmed
  }

  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      // Validate inputs
      validateFilters(filters)
      
      try {
        const { data } = await api.get<AlertsResponse | AlertApiRecord[]>('/api/alerts/', {
          params: {
            state: normalize(filters.state),
            scam_type: normalize(filters.scamType),
          },
        })

        // Handle different response formats
        let results: AlertApiRecord[] = []
        
        if (Array.isArray(data)) {
          results = data
        } else if (data && typeof data === 'object') {
          const alertsResponse = data as AlertsResponse
          if (Array.isArray(alertsResponse.results)) {
            results = alertsResponse.results
          }
        }

        // Validate results structure
        if (!Array.isArray(results)) {
          console.warn('Invalid alerts response format:', data)
          return []
        }

        // Filter out invalid records
        return results.filter((record): record is AlertApiRecord => {
          return (
            record &&
            typeof record === 'object' &&
            typeof record.id === 'string' &&
            typeof record.title === 'string' &&
            typeof record.region === 'string' &&
            typeof record.severity === 'string'
          )
        })
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
        // Return empty array on error to prevent UI crashes
        return []
      }
    },
    refetchInterval: 30000,
    refetchOnMount: true,
    // Query function already handles errors and returns an empty array.
    // Disable retries to avoid unnecessary network traffic.
    retry: false,
    staleTime: 15000, // Consider data fresh for 15 seconds
  })
}
