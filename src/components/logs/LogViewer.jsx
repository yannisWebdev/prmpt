import { useCallback, useLayoutEffect, useRef } from 'react'
import { ArrowDown, ArrowUp, RadioTower } from 'lucide-react'
import { ROW_HEIGHT } from '../../constants/logs'
import { formatShortTime } from '../../utils/formatDate'
import { LogDetails } from './LogDetails'
import { LogRow } from './LogRow'

export function LogViewer({
  logs, totalCount, windowStart, windowEnd, hasOlder, hasNewer, isLoading,
  onLoadOlder, onLoadNewer, selectedLog, onSelectLog,
}) {
  const scrollRef = useRef(null)
  const prependAnchorRef = useRef(null)
  const loadingRef = useRef({ older: false, newer: false })

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

  return (
    <section className="log-viewer" aria-label="Network logs">
      <div
        className="timeline-window"
        data-window-start={logs[0]?.id ?? ''}
        data-window-end={logs[logs.length - 1]?.id ?? ''}
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
            <span>{isLoading ? 'Loading logs...' : hasNewer ? 'Load newer logs' : 'Newest log reached'}</span>
          <ArrowDown size={14} />
        </button>
      </div>
      <div className="log-scroll" ref={scrollRef} onScroll={handleScroll} role="table" aria-rowcount={totalCount} tabIndex={0}>
        <div className="log-header" role="row">
          <span className="operator-header" title="Operator strip" />
          <span>Timestamp</span><span>Device</span><span>Operator</span><span>Net</span>
          <span>RSRP</span><span>Level</span><span>Text</span>
        </div>
        {logs.length === 0 ? (
          <div className="empty-state">
            <RadioTower size={28} />
            <strong>No logs are available.</strong>
            <span>Try another date or wait for the API page to load.</span>
          </div>
        ) : (
          <div className="log-list">
            {logs.map((log) => {
              return (
                <LogRow key={log.id} log={log} selected={selectedLog?.id === log.id} onSelect={onSelectLog} />
              )
            })}
          </div>
        )}
      </div>

      {selectedLog && (
        <LogDetails
          log={selectedLog}
          onClose={() => onSelectLog(null)}
        />
      )}
    </section>
  )
}
