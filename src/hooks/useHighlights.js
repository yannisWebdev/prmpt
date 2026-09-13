import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useHighlights() {
  const [highlights, setHighlights] = useLocalStorage('network-logs:highlights', {})

  const setHighlight = useCallback((logId, color) => {
    setHighlights((current) => {
      const next = { ...current }
      if (color) next[logId] = color
      else delete next[logId]
      return next
    })
  }, [setHighlights])

  return { highlights, setHighlight }
}
