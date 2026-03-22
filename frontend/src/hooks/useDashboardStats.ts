import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { DashboardStatsResponse } from '../types/api'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get<DashboardStatsResponse>('/api/dashboard/')
      return data
    },
    refetchInterval: 15_000,
  })
}
