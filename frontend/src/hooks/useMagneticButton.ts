import { useEffect, useRef, useState } from 'react'

export interface MagneticState {
  x: number
  y: number
}

export function useMagneticButton(strength = 14) {
  const ref = useRef<HTMLElement | null>(null)
  const [state, setState] = useState<MagneticState>({ x: 0, y: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const onMove = (event: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const relX = event.clientX - (rect.left + rect.width / 2)
      const relY = event.clientY - (rect.top + rect.height / 2)
      setState({ x: relX / strength, y: relY / strength })
    }

    const onLeave = () => setState({ x: 0, y: 0 })

    element.addEventListener('mousemove', onMove)
    element.addEventListener('mouseleave', onLeave)

    return () => {
      element.removeEventListener('mousemove', onMove)
      element.removeEventListener('mouseleave', onLeave)
    }
  }, [strength])

  return { ref, state }
}

export default useMagneticButton
