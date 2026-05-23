import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { CreateReportRequest, CreateReportResponse, ReportsResponse } from '../types/api'

export function useReports() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data } = await api.get<ReportsResponse>('/api/reports/')
      return data.results
    },
    staleTime: 30_000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
  })
}

export function useCreateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateReportRequest) => {
      const { data } = await api.post<CreateReportResponse>('/api/reports/submit/', {
        entity: payload.entity,
        entity_type: payload.entity_type ?? 'message',
        scam_type: payload.scamType,
        description: payload.description,
        state: payload.state,
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
