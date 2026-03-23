import { useEffect, useState } from 'react'

export function useCountUp(target: number, duration = 1500, start = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!start) return
    let startTime: number
    let animationFrame: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) 
      // check if it's float (for accuracy rate)
      const isFloat = target % 1 !== 0
      
      const currentVal = target * eased
      setValue(isFloat ? Number(currentVal.toFixed(1)) : Math.round(currentVal))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      }
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration, start])

  return value
}