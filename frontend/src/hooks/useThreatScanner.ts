import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { ThreatCheckRequest, ThreatCheckResponse } from '../types/api'

export function useThreatScanner() {
  return useMutation({
    mutationFn: async (payload: ThreatCheckRequest) => {
      const { data } = await api.post<ThreatCheckResponse>('/api/threat-check/', payload)
      return data
    },
  })
}
