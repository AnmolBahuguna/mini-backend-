import { useEffect, useRef, useState } from 'react'

export function CustomCursor() {
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return !coarse && !reduced
  })
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [fx, setFx] = useState(0)
  const [fy, setFy] = useState(0)
  const timeoutRef = useRef<number | undefined>()
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const onMove = (event: MouseEvent) => {
      if (!mountedRef.current) return
      setX(event.clientX)
      setY(event.clientY)
      
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      // Set new timeout for follower
      timeoutRef.current = window.setTimeout(() => {
        if (mountedRef.current) {
          setFx(event.clientX)
          setFy(event.clientY)
        }
      }, 22)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div 
        className="cursor" 
        aria-hidden="true" 
        style={{ left: `${x}px`, top: `${y}px` }} 
      />
      <div 
        className="cursor-follower" 
        aria-hidden="true" 
        style={{ left: `${fx}px`, top: `${fy}px` }} 
      />
    </>
  )
}

export default CustomCursor
