import { useCallback, useRef, useState } from 'react'

export const useCopy = () => {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<number | null>()

  const copy = useCallback((text: string, timeout = 1000) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }
    setCopied(true)
    navigator.clipboard.writeText(text)
    timeoutRef.current = window.setTimeout(() => {
      setCopied(false)
    }, timeout)
  }, [])

  return [copy, copied] as const
}
