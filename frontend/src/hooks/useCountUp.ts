import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let frame = 0
    const totalFrames = Math.max(1, Math.round(duration / 16))
    const step = () => {
      frame += 1
      const progress = frame / totalFrames
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (frame < totalFrames) requestAnimationFrame(step)
    }
    step()
  }, [target, duration])

  return value
}
