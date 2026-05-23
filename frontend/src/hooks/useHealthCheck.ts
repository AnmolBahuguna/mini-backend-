import { useEffect, useState } from 'react'
import { api } from '../lib/api'

interface HealthStatus {
  status: 'connected' | 'disconnected' | 'checking'
  message: string
  lastChecked: Date | null
}

export function useHealthCheck() {
  const [health, setHealth] = useState<HealthStatus>({
    status: 'checking',
    message: 'Checking connection...',
    lastChecked: null,
  })

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.get('/api/', { timeout: 5000 })
        if (response.status === 200) {
          setHealth({
            status: 'connected',
            message: 'Backend is online',
            lastChecked: new Date(),
          })
        }
      } catch {
        setHealth({
          status: 'disconnected',
          message: 'Backend is offline. Ensure Django server is running on http://localhost:8000',
          lastChecked: new Date(),
        })
      }
    }

    // Check immediately
    checkHealth()

    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000)

    return () => clearInterval(interval)
  }, [])

  return health
}
