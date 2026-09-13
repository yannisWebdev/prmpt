import { memo } from 'react'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { formatLogTime } from '../../utils/formatDate'
import { HIGHLIGHT_COLORS } from '../../constants/logs'
import { OperatorStrip } from './OperatorStrip'
import { RsrpIndicator } from './RsrpIndicator'
import { SeverityBadge } from './SeverityBadge'

export const LogRow = memo(function LogRow({
  log, selected, focused, bookmarked, highlight, theme, onSelect, onToggleBookmark,
}) {
  const highlightStyle = highlight && HIGHLIGHT_COLORS[highlight]
    ? { backgroundColor: HIGHLIGHT_COLORS[highlight][theme] }
    : undefined

  return (
    <div
      role="row"
      tabIndex={0}
      className={`log-row ${selected ? 'is-selected' : ''} ${focused ? 'is-focused' : ''}`}
      style={highlightStyle}
      onClick={() => onSelect(log)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(log)
        }
      }}
      data-log-id={log.id}
    >
      <OperatorStrip operator={log.operator} />
      <span className="cell timestamp-cell">{formatLogTime(log.timestamp)}</span>
      <span className="cell device-cell">{log.deviceId}</span>
      <span className="cell operator-cell" title={log.operator}>{log.operator === 'Bouygues Telecom' ? 'Bouygues' : log.operator}</span>
      <span className="cell network-cell">{log.context.networkType}</span>
      <span className="cell rsrp-cell"><RsrpIndicator value={log.rsrp} /></span>
      <span className="cell severity-cell"><SeverityBadge severity={log.severity} /></span>
      <span className="cell message-cell" title={log.message}>{log.message}</span>
      <button
        type="button"
        className={`row-bookmark ${bookmarked ? 'is-bookmarked' : ''}`}
        aria-label={bookmarked ? `Remove bookmark from ${log.id}` : `Bookmark ${log.id}`}
        title={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        onClick={(event) => { event.stopPropagation(); onToggleBookmark(log.id) }}
      >
        {bookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
      </button>
    </div>
  )
})
