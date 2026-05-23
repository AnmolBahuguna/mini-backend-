import { useState, useCallback, useRef, useEffect } from 'react'
import { panicApi, type CreatePanicRequest } from '../api'
import { useUIStore } from '../store/uiStore'

interface UsePanicReturn {
  triggerSOS: (message?: string) => Promise<void>
  status: 'idle' | 'locating' | 'sending' | 'sent' | 'failed'
  isCoolingDown: boolean
  cooldownSeconds: number
  cooldown: number
  canTrigger: boolean
  buttonDisabled: boolean
  error: string | null
}

const COOLDOWN_SECONDS = 30

export function usePanicAPI(): UsePanicReturn {
  const [status, setStatus] = useState<'idle' | 'locating' | 'sending' | 'sent' | 'failed'>('idle')
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { addToast } = useUIStore()

  const startCooldown = useCallback(() => {
    setCooldownSeconds(COOLDOWN_SECONDS)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!)
          cooldownRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const triggerSOS = useCallback(async (message?: string) => {
    if (cooldownSeconds > 0) {
      throw new Error(`Please wait ${cooldownSeconds}s before sending another SOS`)
    }

    try {
      setStatus('locating')
      setError(null)

      // Step 1: Get GPS location
      let latitude: number | undefined
      let longitude: number | undefined

      const position = await new Promise<GeolocationPosition>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (geoError) => {
            console.warn('GPS location unavailable:', geoError.message)
            resolve(null as unknown as GeolocationPosition) // Resolve with null to continue without location
          },
          { timeout: 10000, maximumAge: 60000 }
        )
      })

      if (position) {
        latitude = position.coords.latitude
        longitude = position.coords.longitude
      }

      // Step 2: Send SOS to backend
      setStatus('sending')
      const requestData: CreatePanicRequest = {
        latitude,
        longitude,
        message: message || 'Emergency SOS triggered'
      }

      await panicApi.triggerSOS(requestData)
      
      setStatus('sent')
      startCooldown()
      addToast('SOS sent successfully. Help is on the way.', 'success')

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'SOS failed'
      setStatus('failed')
      setError(errorMessage)
      addToast(errorMessage, 'error')
      throw err
    }
  }, [cooldownSeconds, startCooldown, addToast])

  const isCoolingDown = cooldownSeconds > 0
  const canTrigger = !isCoolingDown && status !== 'sending' && status !== 'locating'
  const buttonDisabled = isCoolingDown || status === 'sending'

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current)
        cooldownRef.current = null
      }
    }
  }, [])

  return {
    triggerSOS,
    status,
    isCoolingDown,
    cooldownSeconds,
    cooldown: cooldownSeconds,
    canTrigger,
    error,
    buttonDisabled
  }
}

export const usePanic = usePanicAPI

