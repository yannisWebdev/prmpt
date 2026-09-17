import { X } from 'lucide-react'
import { formatFullDate } from '../../utils/formatDate'
import { getRsrpQuality } from '../../utils/rsrp'
import { IconButton } from '../ui/IconButton'
import { SeverityBadge } from './SeverityBadge'

function Detail({ label, children }) {
  return <div className="detail-item"><dt>{label}</dt><dd>{children}</dd></div>
}

export function LogDetails({ log, onClose }) {
  if (!log) return null
  return (
    <aside className="log-details" aria-label={`Details for ${log.id}`}>
      <div className="details-header">
        <div>
          <span className="details-eyebrow">SELECTED EVENT / {log.id}</span>
          <h2>{log.message}</h2>
        </div>
        <div className="details-actions">
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
