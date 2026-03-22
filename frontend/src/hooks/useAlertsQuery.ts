import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { AlertApiRecord, AlertsResponse } from '../types/api'

interface AlertsFilters {
  state: string
  scamType: string
}

export function useAlertsQuery(filters: AlertsFilters) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const { data } = await api.get<AlertsResponse>('/api/alerts/', {
        params: {
          state: filters.state === 'All' ? undefined : filters.state,
          scam_type: filters.scamType === 'All' ? undefined : filters.scamType,
        },
      })
      return data.results as AlertApiRecord[]
    },
  })
}
