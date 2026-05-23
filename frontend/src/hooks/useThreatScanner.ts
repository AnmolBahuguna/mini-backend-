import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { ThreatCheckRequest, ThreatCheckResponse } from '../types/api'

// Input sanitization function
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000) // Limit input length
}

async function pollThreatCheck(id: string, attempt = 0): Promise<ThreatCheckResponse> {
  if (!id) throw new Error('Missing scan id')
  
  // Prevent infinite polling with maximum attempts
  const maxAttempts = 10
  if (attempt >= maxAttempts) {
    throw new Error('Scan timeout: maximum polling attempts exceeded')
  }
  
  // Exponential backoff with jitter
  const baseDelay = 1200
  const maxDelay = 10000
  const exponentialDelay = Math.min(baseDelay * Math.pow(1.5, attempt), maxDelay)
  const jitter = Math.random() * 200
  const delayMs = exponentialDelay + jitter
  
  await new Promise((resolve) => setTimeout(resolve, delayMs))
  
  try {
    const { data } = await api.get<ThreatCheckResponse>(`/api/threat-check/${id}/`)
    const ready = typeof data?.drs_score === 'number' || data?.risk_level
    
    if (ready) return data
    if (attempt >= 4) return data // Return partial data after 5 attempts
    
    return pollThreatCheck(id, attempt + 1)
  } catch (error) {
    if (attempt >= 2) throw error // Re-throw after a few retries
    return pollThreatCheck(id, attempt + 1)
  }
}

export function useThreatScanner() {
  return useMutation({
    mutationFn: async (payload: ThreatCheckRequest) => {
      // Sanitize input before sending
      const sanitizedPayload = {
        ...payload,
        entity: sanitizeInput(payload.entity),
      }
      
      // Validate entity type
      const validTypes = ['url', 'domain', 'phone', 'email', 'upi', 'ip', 'message']
      if (!validTypes.includes(sanitizedPayload.entity_type)) {
        throw new Error(`Invalid entity type: ${sanitizedPayload.entity_type}`)
      }
      
      const { data } = await api.post<ThreatCheckResponse>('/api/threat-check/', sanitizedPayload)
      
      // Handle immediate response
      if (typeof data?.drs_score === 'number' || data?.risk_level) return data
      
      // Handle async response with polling
      if (data?.id) {
        return pollThreatCheck(data.id)
      }
      
      throw new Error('Scan request accepted but no response received')
    },
    retry: (failureCount, error) => {
      // Only retry on network errors, not on validation errors
      if (error.message.includes('Invalid entity type') || error.message.includes('sanitize')) {
        return false
      }
      return failureCount < 2
    },
  })
}
