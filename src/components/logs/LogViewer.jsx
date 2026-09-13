import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef,
} from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowDown, ArrowUp, RadioTower } from 'lucide-react'
import { ROW_HEIGHT } from '../../constants/logs'
import { formatShortTime } from '../../utils/formatDate'
import { LogDetails } from './LogDetails'
import { LogRow } from './LogRow'

export const LogViewer = forwardRef(function LogViewer({
  logs, totalCount, windowStart, windowEnd, resetVersion, hasOlder, hasNewer,
  onLoadOlder, onLoadNewer, selectedLog, focusedLogId, bookmarks, highlights, theme, onSelectLog,
  onToggleBookmark, onSetHighlight, onVisibleRangeChange, onClearFilters, hasActiveFilters,
}, ref) {
  const scrollRef = useRef(null)
  const prependAnchorRef = useRef(null)
  const loadingRef = useRef({ older: false, newer: false })
  const virtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 16,
    getItemKey: (index) => logs[index]?.id ?? index,
  })
  const virtualItems = virtualizer.getVirtualItems()
  const bookmarkIds = useMemo(() => new Set(bookmarks.map((item) => item.logId)), [bookmarks])

  const requestOlder = useCallback(() => {
    const scrollElement = scrollRef.current
    if (!hasOlder || loadingRef.current.older || !scrollElement || !logs.length) return
    loadingRef.current.older = true
    prependAnchorRef.current = { firstLogId: logs[0].id, scrollTop: scrollElement.scrollTop }
    onLoadOlder()
  }, [hasOlder, logs, onLoadOlder])

  const requestNewer = useCallback(() => {
    if (!hasNewer || loadingRef.current.newer) return
    loadingRef.current.newer = true
    onLoadNewer()
  }, [hasNewer, onLoadNewer])

  const handleScroll = useCallback((event) => {
    const element = event.currentTarget
    const threshold = ROW_HEIGHT * 5
    if (element.scrollTop <= threshold) requestOlder()
    if (element.scrollHeight - element.scrollTop - element.clientHeight <= threshold) requestNewer()
  }, [requestOlder, requestNewer])

  useLayoutEffect(() => {
    const anchor = prependAnchorRef.current
    const scrollElement = scrollRef.current
    if (anchor && scrollElement) {
      const insertedRows = logs.findIndex((log) => log.id === anchor.firstLogId)
      if (insertedRows > 0) scrollElement.scrollTop = anchor.scrollTop + insertedRows * ROW_HEIGHT
      prependAnchorRef.current = null
    }
    loadingRef.current = { older: false, newer: false }
  }, [logs])

  useLayoutEffect(() => {
    if (!logs.length) return
    virtualizer.scrollToIndex(Math.floor(logs.length / 2), { align: 'center' })
  }, [resetVersion])

  useImperativeHandle(ref, () => ({
    scrollToIndex(index, options = {}) {
      if (index < 0 || index >= logs.length) return
      virtualizer.scrollToIndex(index, { align: options.align ?? 'center', behavior: options.behavior ?? 'auto' })
    },
    getScrollElement() { return scrollRef.current },
  }), [virtualizer, logs.length])

  useEffect(() => {
    if (!virtualItems.length) {
      onVisibleRangeChange({ start: 0, end: 0 })
      return
    }
    onVisibleRangeChange({
      start: virtualItems[0].index,
      end: virtualItems[virtualItems.length - 1].index,
    })
  }, [virtualItems, onVisibleRangeChange])

  return (
    <section className="log-viewer" aria-label="Network logs">
      <div
        className="timeline-window"
        data-window-start={windowStart}
        data-window-end={windowEnd}
        data-total-count={totalCount}
      >
        <button type="button" onClick={requestOlder} disabled={!hasOlder}>
          <ArrowUp size={14} />
          <span>{hasOlder ? 'Load earlier logs' : 'Oldest log reached'}</span>
        </button>
        <div className="timeline-window-status">
          <div className="timeline-window-copy">
            <strong>{logs.length.toLocaleString()} loaded</strong>
            <span>of {totalCount.toLocaleString()}</span>
            {logs.length > 0 && <i>{formatShortTime(logs[0].timestamp)} → {formatShortTime(logs[logs.length - 1].timestamp)}</i>}
          </div>
          <div className="timeline-progress" aria-hidden="true">
            <span style={{ left: `${totalCount ? (windowStart / totalCount) * 100 : 0}%`, width: `${totalCount ? ((windowEnd - windowStart) / totalCount) * 100 : 0}%` }} />
          </div>
        </div>
        <button type="button" onClick={requestNewer} disabled={!hasNewer}>
          <span>{hasNewer ? 'Load newer logs' : 'Newest log reached'}</span>
          <ArrowDown size={14} />
        </button>
      </div>
      <div className="log-header" role="row">
        <span className="operator-header" title="Operator strip" />
        <span>Timestamp</span><span>Device</span><span>Operator</span><span>Net</span>
        <span>RSRP</span><span>Level</span><span>Message</span><span />
      </div>

      <div className="log-scroll" ref={scrollRef} onScroll={handleScroll} role="table" aria-rowcount={totalCount} tabIndex={0}>
        {logs.length === 0 ? (
          <div className="empty-state">
            <RadioTower size={28} />
            <strong>No logs match the current filters.</strong>
            <span>Adjust the search or filtering criteria to restore events.</span>
            {hasActiveFilters && <button type="button" onClick={onClearFilters}>Clear all filters</button>}
          </div>
        ) : (
          <div className="virtual-list" style={{ height: virtualizer.getTotalSize() }}>
            {virtualItems.map((virtualRow) => {
              const log = logs[virtualRow.index]
              return (
                <div
                  key={virtualRow.key}
                  className="virtual-row"
                  style={{ height: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }}
                >
                  <LogRow
                    log={log}
                    selected={selectedLog?.id === log.id}
                    focused={focusedLogId === log.id}
                    bookmarked={bookmarkIds.has(log.id)}
                    highlight={highlights[log.id]}
                    theme={theme}
                    onSelect={onSelectLog}
                    onToggleBookmark={onToggleBookmark}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedLog && (
        <LogDetails
          log={selectedLog}
          bookmarked={bookmarkIds.has(selectedLog.id)}
          highlight={highlights[selectedLog.id]}
          onClose={() => onSelectLog(null)}
          onToggleBookmark={onToggleBookmark}
          onSetHighlight={onSetHighlight}
        />
      )}
    </section>
  )
})
