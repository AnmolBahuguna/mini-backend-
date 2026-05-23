import { useState, useCallback, useEffect, useRef } from 'react'
import { threatsApi, type ScanResult, type ScanRequest } from '../api'

export interface UseThreatCheckReturn {
  scan: (value: string, type: ScanRequest['type']) => Promise<ScanResult>
  result: ScanResult | null
  progress: number
  loading: boolean
  error: string | null
  reset: () => void
}

export function useThreatCheckAPI(): UseThreatCheckReturn {
  const [result, setResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const scan = useCallback(async (value: string, type: ScanRequest['type']) => {
    setLoading(true)
    setError(null)
    setProgress(0)
    setResult(null)

    // Clear any existing polling
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    try {
      setProgress(25)
      const initial = await threatsApi.scanThreat({ type, value })
      const id = initial.id
      setProgress(50)
      if (!id) {
        setResult(initial)
        setProgress(100)
        setLoading(false)
        return initial
      }

      // Start polling for completion
      let pollCount = 0
      const maxPolls = 10

      intervalRef.current = setInterval(async () => {
        pollCount += 1
        try {
          const scanResult = await threatsApi.getThreat(id)
          const status = String(scanResult.status)
          
          if (status === 'complete' || status === 'completed') {
            setProgress(100)
            setResult(scanResult)
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            setLoading(false)
          } else if (status === 'error' || status === 'failed') {
            setError('Threat scan failed')
            setProgress(0)
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            setLoading(false)
          } else if (status === 'processing' || status === 'pending') {
            setProgress(75) // Enriching
          }

          // Retry ceiling check
          if (pollCount >= maxPolls) {
            setError('Scan timeout - please try again')
            setProgress(0)
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            setLoading(false)
          }
        } catch {
          if (pollCount >= maxPolls) {
            setError('Scan failed after retries')
            setProgress(0)
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            setLoading(false)
          }
        }
      }, 3000) // Poll every 3 seconds
      return initial

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Threat scan failed'
      setError(message)
      setProgress(0)
      setLoading(false)
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setLoading(false)
    setError(null)
    setProgress(0)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])

  return { scan, result, progress, loading, error, reset }
}
