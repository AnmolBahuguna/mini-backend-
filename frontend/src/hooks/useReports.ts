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
  })
}

export function useCreateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateReportRequest) => {
      const { data } = await api.post<CreateReportResponse>('/api/reports/', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}
