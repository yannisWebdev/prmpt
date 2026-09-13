import { Bookmark, BookmarkCheck, Highlighter, X } from 'lucide-react'
import { HIGHLIGHT_COLORS } from '../../constants/logs'
import { formatFullDate } from '../../utils/formatDate'
import { getRsrpQuality } from '../../utils/rsrp'
import { IconButton } from '../ui/IconButton'
import { SeverityBadge } from './SeverityBadge'

function Detail({ label, children }) {
  return <div className="detail-item"><dt>{label}</dt><dd>{children}</dd></div>
}

export function LogDetails({ log, bookmarked, highlight, onClose, onToggleBookmark, onSetHighlight }) {
  if (!log) return null
  return (
    <aside className="log-details" aria-label={`Details for ${log.id}`}>
      <div className="details-header">
        <div>
          <span className="details-eyebrow">SELECTED EVENT / {log.id}</span>
          <h2>{log.message}</h2>
        </div>
        <div className="details-actions">
          <button type="button" className={`detail-action ${bookmarked ? 'is-active' : ''}`} onClick={() => onToggleBookmark(log.id)}>
            {bookmarked ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
            {bookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
          <div className="highlight-actions" aria-label="Highlight color">
            <Highlighter size={17} aria-hidden="true" />
            <span className="highlight-label">Highlight</span>
            {Object.entries(HIGHLIGHT_COLORS).map(([color, config]) => (
              <button
                type="button"
                key={color}
                className={highlight === color ? 'is-active' : ''}
                style={{ '--swatch': config.swatch }}
                aria-label={`Highlight ${config.label}`}
                title={`Highlight ${config.label}`}
                onClick={() => onSetHighlight(log.id, highlight === color ? null : color)}
              />
            ))}
            {highlight && <button type="button" className="remove-highlight" onClick={() => onSetHighlight(log.id, null)}>Remove</button>}
          </div>
          <IconButton label="Close log details" onClick={onClose}><X size={18} /></IconButton>
        </div>
      </div>
      <div className="details-body">
        <dl className="details-grid">
          <Detail label="Device">{log.deviceId}</Detail>
          <Detail label="Timestamp">{formatFullDate(log.timestamp)}</Detail>
          <Detail label="Operator">{log.operator}</Detail>
          <Detail label="Severity"><SeverityBadge severity={log.severity} /></Detail>
          <Detail label="RSRP">{log.rsrp} dBm · {getRsrpQuality(log.rsrp)}</Detail>
          <Detail label="Network">{log.context.networkType} · {log.context.frequency} MHz</Detail>
          <Detail label="Cell ID">{log.context.cellId}</Detail>
          <Detail label="Link">{log.context.latency} ms · {log.context.packetLoss}% loss</Detail>
        </dl>
        <pre>{JSON.stringify(log.context, null, 2)}</pre>
      </div>
    </aside>
  )
}
