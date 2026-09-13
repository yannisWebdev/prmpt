import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookmarkPanel } from './components/bookmarks/BookmarkPanel'
import { LogToolbar } from './components/filters/LogToolbar'
import { LogViewer } from './components/logs/LogViewer'
import { LogMinimap } from './components/minimap/LogMinimap'
import { useBookmarks } from './hooks/useBookmarks'
import { useHighlights } from './hooks/useHighlights'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useLogFilters } from './hooks/useLogFilters'
import { useProgressiveLogs } from './hooks/useProgressiveLogs'
import { generateLogs } from './mocks/generateLogs'
import { findClosestLogIndex, parseUtcDateTimeLocal } from './utils/logDateNavigation'

const ALL_LOGS = generateLogs()

export default function App() {
  const viewerRef = useRef(null)
  const focusTimerRef = useRef(null)
  const [selectedLog, setSelectedLog] = useState(null)
  const [focusedLogId, setFocusedLogId] = useState(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 })
  const [hiddenBookmarkId, setHiddenBookmarkId] = useState(null)
  const [pendingLogId, setPendingLogId] = useState(null)
  const [panelOpen, setPanelOpen] = useLocalStorage('network-logs:bookmark-panel', true)
  const [theme, setTheme] = useLocalStorage('network-logs:theme', 'dark')
  const { bookmarks, toggleBookmark, updateNote } = useBookmarks()
  const { highlights, setHighlight } = useHighlights()
  const {
    filters, setFilters, filteredLogs, stats, clearFilters, hasActiveFilters,
  } = useLogFilters(ALL_LOGS)
  const {
    loadedLogs, windowStart, windowEnd, resetVersion, hasOlder, hasNewer,
    loadOlder, loadNewer, ensureIndexLoaded,
  } = useProgressiveLogs(filteredLogs)

  const devices = useMemo(() => [...new Set(ALL_LOGS.map((log) => log.deviceId))].sort(), [])
  const logsById = useMemo(() => new Map(ALL_LOGS.map((log) => [log.id, log])), [])
  const filteredIndexById = useMemo(() => new Map(filteredLogs.map((log, index) => [log.id, index])), [filteredLogs])
  const visibleLogIds = useMemo(() => new Set(filteredIndexById.keys()), [filteredIndexById])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])

  useEffect(() => () => window.clearTimeout(focusTimerRef.current), [])

  const focusLog = useCallback((logId) => {
    setFocusedLogId(logId)
    window.clearTimeout(focusTimerRef.current)
    focusTimerRef.current = window.setTimeout(() => setFocusedLogId(null), 1200)
  }, [])

  const scrollToLog = useCallback((logId) => {
    const index = filteredIndexById.get(logId)
    if (index === undefined) {
      setHiddenBookmarkId(logId)
      setPanelOpen(true)
      return false
    }
    setHiddenBookmarkId(null)
    setPendingLogId(logId)
    return true
  }, [filteredIndexById, setPanelOpen])

  useEffect(() => {
    if (!pendingLogId) return
    const index = filteredIndexById.get(pendingLogId)
    if (index === undefined) return
    if (index < windowStart || index >= windowEnd) {
      ensureIndexLoaded(index)
      return
    }
    viewerRef.current?.scrollToIndex(index - windowStart, { align: 'center' })
    focusLog(pendingLogId)
    setHiddenBookmarkId(null)
    setPendingLogId(null)
  }, [pendingLogId, filteredIndexById, windowStart, windowEnd, ensureIndexLoaded, focusLog])

  const revealLog = useCallback((logId) => {
    clearFilters()
    setPendingLogId(logId)
  }, [clearFilters])

  const navigateFromMinimap = useCallback((index) => {
    const log = filteredLogs[index]
    if (!log) return
    setPendingLogId(log.id)
  }, [filteredLogs])

  const navigateToDate = useCallback((dateTimeValue) => {
    const index = findClosestLogIndex(filteredLogs, parseUtcDateTimeLocal(dateTimeValue))
    if (index < 0) return
    setPendingLogId(filteredLogs[index].id)
  }, [filteredLogs])

  const handleVisibleRangeChange = useCallback((range) => {
    const absoluteRange = { start: windowStart + range.start, end: windowStart + range.end }
    setVisibleRange((current) => (
      current.start === absoluteRange.start && current.end === absoluteRange.end ? current : absoluteRange
    ))
  }, [windowStart])

  return (
    <div className="app-shell">
      <LogToolbar
        filters={filters}
        setFilters={setFilters}
        devices={devices}
        total={filteredLogs.length}
        stats={stats}
        bookmarkCount={bookmarks.length}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((value) => !value)}
        theme={theme}
        onToggleTheme={() => setTheme((value) => value === 'dark' ? 'light' : 'dark')}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        minTimestamp={filteredLogs[0]?.timestamp}
        maxTimestamp={filteredLogs[filteredLogs.length - 1]?.timestamp}
        onNavigateToDate={navigateToDate}
      />
      <main className="workspace">
        <LogViewer
          ref={viewerRef}
          logs={loadedLogs}
          totalCount={filteredLogs.length}
          windowStart={windowStart}
          windowEnd={windowEnd}
          resetVersion={resetVersion}
          hasOlder={hasOlder}
          hasNewer={hasNewer}
          onLoadOlder={loadOlder}
          onLoadNewer={loadNewer}
          selectedLog={selectedLog}
          focusedLogId={focusedLogId}
          bookmarks={bookmarks}
          highlights={highlights}
          theme={theme}
          onSelectLog={setSelectedLog}
          onToggleBookmark={toggleBookmark}
          onSetHighlight={setHighlight}
          onVisibleRangeChange={handleVisibleRangeChange}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
        <LogMinimap logs={filteredLogs} visibleRange={visibleRange} onNavigate={navigateFromMinimap} />
        <BookmarkPanel
          open={panelOpen}
          bookmarks={bookmarks}
          logsById={logsById}
          visibleLogIds={visibleLogIds}
          hiddenBookmarkId={hiddenBookmarkId}
          onClose={() => setPanelOpen(false)}
          onNavigate={scrollToLog}
          onRemove={toggleBookmark}
          onUpdateNote={updateNote}
          onReveal={revealLog}
        />
      </main>
    </div>
  )
}
