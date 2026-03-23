import { useEffect, useState } from 'react'

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

  useEffect(() => {
    if (!enabled) return

    const onMove = (event: MouseEvent) => {
      setX(event.clientX)
      setY(event.clientY)
      setTimeout(() => {
        setFx(event.clientX)
        setFy(event.clientY)
      }, 22)
    }

    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div className="cursor" aria-hidden style={{ left: `${x}px`, top: `${y}px` }} />
      <div className="cursor-follower" aria-hidden style={{ left: `${fx}px`, top: `${fy}px` }} />
    </>
  )
}

export default CustomCursor
