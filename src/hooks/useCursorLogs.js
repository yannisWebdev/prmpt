import { useCallback, useEffect, useRef, useState } from 'react'

const PAGE_SIZE = 100

export function useCursorLogs({ fetchPage, mapLogs = (logs) => ({ logs, lastRsrp: -100 }) }) {
  const [state, setState] = useState({ logs: [], previousToken: undefined, nextToken: undefined, totalCount: 0, windowStart: 0, windowEnd: 0, isLoading: true })
  const lastRsrpRef = useRef(-100)

  const load = useCallback(async ({ token, direction, reset = false } = {}) => {
    setState((current) => ({ ...current, isLoading: true }))
    const page = await fetchPage({ token, direction, limit: PAGE_SIZE })
    const mappedPage = mapLogs(page.logs, reset || direction === 'previous' ? -100 : lastRsrpRef.current)
    lastRsrpRef.current = mappedPage.lastRsrp
    setState((current) => ({
      logs: reset || !current.logs.length ? mappedPage.logs : direction === 'previous' ? [...mappedPage.logs, ...current.logs] : [...current.logs, ...mappedPage.logs],
      previousToken: reset || direction === 'previous' ? page.previous_token : current.previousToken,
      nextToken: reset || direction === 'next' ? page.next_token : current.nextToken,
      totalCount: page.total_count ?? page.logs.length,
      windowStart: reset
        ? page.start_index ?? Math.max(0, Math.floor((page.total_count ?? page.logs.length) / 2) - Math.floor(page.logs.length / 2))
        : direction === 'previous' ? Math.max(0, current.windowStart - page.logs.length) : current.windowStart,
      windowEnd: reset
        ? (page.start_index ?? Math.max(0, Math.floor((page.total_count ?? page.logs.length) / 2) - Math.floor(page.logs.length / 2))) + page.logs.length
        : direction === 'previous' ? current.windowEnd : current.windowEnd + page.logs.length,
      isLoading: false,
    }))
  }, [fetchPage])

  useEffect(() => { load({ reset: true }) }, [load])

  const loadPrevious = useCallback(() => state.previousToken != null && load({ token: state.previousToken, direction: 'previous' }), [load, state.previousToken])
  const loadNext = useCallback(() => state.nextToken != null && load({ token: state.nextToken, direction: 'next' }), [load, state.nextToken])
  const replaceLogs = useCallback((token) => load({ token, reset: true }), [load])

  return { ...state, hasPrevious: state.previousToken != null, hasNext: state.nextToken != null, loadPrevious, loadNext, replaceLogs }
}