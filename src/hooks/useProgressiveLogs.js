import { useCallback, useMemo, useState } from 'react'

const INITIAL_WINDOW_SIZE = 600
const LOAD_BATCH_SIZE = 300
const MAX_WINDOW_SIZE = 1200

function createInitialRange(length) {
  if (length <= INITIAL_WINDOW_SIZE) return { start: 0, end: length }
  const center = Math.floor(length / 2)
  const start = Math.max(0, center - Math.floor(INITIAL_WINDOW_SIZE / 2))
  return { start, end: Math.min(length, start + INITIAL_WINDOW_SIZE) }
}

export function useProgressiveLogs(logs) {
  const [windowState, setWindowState] = useState(() => ({
    source: logs,
    ...createInitialRange(logs.length),
    resetVersion: 0,
  }))

  let activeState = windowState
  if (windowState.source !== logs) {
    activeState = {
      source: logs,
      ...createInitialRange(logs.length),
      resetVersion: windowState.resetVersion + 1,
    }
    setWindowState(activeState)
  }

  const { start, end, resetVersion } = activeState
  const loadedLogs = useMemo(() => logs.slice(start, end), [logs, start, end])

  const loadOlder = useCallback(() => {
    setWindowState((current) => {
      const nextStart = Math.max(0, current.start - LOAD_BATCH_SIZE)
      if (nextStart === current.start) return current
      return {
        ...current,
        start: nextStart,
        end: Math.min(current.end, nextStart + MAX_WINDOW_SIZE),
      }
    })
  }, [])

  const loadNewer = useCallback(() => {
    setWindowState((current) => {
      const nextEnd = Math.min(current.source.length, current.end + LOAD_BATCH_SIZE)
      if (nextEnd === current.end) return current
      return {
        ...current,
        start: Math.max(current.start, nextEnd - MAX_WINDOW_SIZE),
        end: nextEnd,
      }
    })
  }, [])

  const ensureIndexLoaded = useCallback((index) => {
    setWindowState((current) => {
      if (index >= current.start && index < current.end) return current
      const halfWindow = Math.floor(INITIAL_WINDOW_SIZE / 2)
      let nextStart = Math.max(0, index - halfWindow)
      let nextEnd = Math.min(current.source.length, nextStart + INITIAL_WINDOW_SIZE)
      nextStart = Math.max(0, nextEnd - INITIAL_WINDOW_SIZE)
      return { ...current, start: nextStart, end: nextEnd }
    })
  }, [])

  return {
    loadedLogs,
    windowStart: start,
    windowEnd: end,
    resetVersion,
    hasOlder: start > 0,
    hasNewer: end < logs.length,
    loadOlder,
    loadNewer,
    ensureIndexLoaded,
  }
}
