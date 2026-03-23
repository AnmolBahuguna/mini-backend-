import { useEffect, useState } from 'react'

export interface TypewriterOptions {
  text: string
  speed?: number
  startDelay?: number
}

export function useTypewriter({ text, speed = 24, startDelay = 0 }: TypewriterOptions) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    let index = 0
    let intervalId: ReturnType<typeof setInterval> | undefined

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        index += 1
        setDisplayedText(text.slice(0, index))
        if (index >= text.length && intervalId) {
          clearInterval(intervalId)
        }
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [text, speed, startDelay])

  return displayedText
}

export default useTypewriter
