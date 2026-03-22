import { useEffect, useState } from 'react'

export interface MouseParallax {
  x: number
  y: number
}

export function useMouseParallax() {
  const [position, setPosition] = useState<MouseParallax>({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = (event.clientY / window.innerHeight) * 2 - 1
      setPosition({ x, y })
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return position
}

export default useMouseParallax
