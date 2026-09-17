import { useCallback, useState } from 'react'
import { LogToolbar } from './components/filters/LogToolbar'
import { LogViewer } from './components/logs/LogViewer'
import { useCursorLogs } from './hooks/useCursorLogs'
import { generateLogs } from './mocks/generateLogs'
import { normalizeApiLogs } from './utils/logApi'
import { findClosestLogIndex, parseUtcDateTimeLocal } from './utils/logDateNavigation'

const ALL_LOGS = generateLogs()

export default function App() {
  const [selectedLog, setSelectedLog] = useState(null)
  const {
    logs, totalCount, windowStart, windowEnd, hasPrevious, hasNext, isLoading,
    loadPrevious, loadNext, replaceLogs,
  } = useCursorLogs({ fetchPage: fetchMockPage, mapLogs: normalizeApiLogs })

  const navigateToDate = useCallback((dateTimeValue) => {
    const index = findClosestLogIndex(ALL_LOGS, parseUtcDateTimeLocal(dateTimeValue))
    if (index < 0) return
    replaceLogs(`at:${index}`)
  }, [replaceLogs])

  return (
    <div className="app-shell">
      <LogToolbar
        minTimestamp={ALL_LOGS[0]?.date}
        maxTimestamp={ALL_LOGS[ALL_LOGS.length - 1]?.date}
        onNavigateToDate={navigateToDate}
      />
      <main className="workspace">
        <LogViewer
          logs={logs}
          totalCount={totalCount}
          windowStart={windowStart}
          windowEnd={windowEnd}
          hasOlder={hasPrevious}
          hasNewer={hasNext}
          isLoading={isLoading}
          onLoadOlder={loadPrevious}
          onLoadNewer={loadNext}
          selectedLog={selectedLog}
          onSelectLog={setSelectedLog}
        />
      </main>
    </div>
  )
}

async function fetchMockPage({ token, direction, limit }) {
  const tokenIndex = token?.startsWith('at:') ? Number(token.slice(3)) : token ? Number(token.split(':')[1]) : Math.floor(ALL_LOGS.length / 2)
  const start = Number.isFinite(tokenIndex) ? tokenIndex : Math.floor(ALL_LOGS.length / 2)
  const pageStart = direction === 'previous' ? Math.max(0, start - limit) : direction === 'next' ? Math.min(ALL_LOGS.length - limit, start + limit) : Math.max(0, start - Math.floor(limit / 2))
  const end = Math.min(ALL_LOGS.length, pageStart + limit)
  return {
    logs: ALL_LOGS.slice(pageStart, end),
    previous_token: pageStart > 0 ? `previous:${pageStart}` : null,
    next_token: end < ALL_LOGS.length ? `next:${end}` : null,
    total_count: ALL_LOGS.length,
    start_index: pageStart,
    end_index: end,
  }
}
