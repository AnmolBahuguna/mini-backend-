import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { AlertApiRecord, AlertsResponse } from '../types/api'

interface AlertsFilters {
  state: string
  scamType: string
}

export function useAlertsQuery(filters: AlertsFilters) {
  const normalize = (value: string) => (value?.toLowerCase().startsWith('all') ? undefined : value)

  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      const { data } = await api.get<AlertsResponse>('/api/alerts/', {
        params: {
          state: normalize(filters.state),
          scam_type: normalize(filters.scamType),
        },
      })
      return data.results as AlertApiRecord[]
    },
  })
}
