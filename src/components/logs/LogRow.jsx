import { memo } from 'react'
import { formatLogTime } from '../../utils/formatDate'
import { OperatorStrip } from './OperatorStrip'
import { RsrpIndicator } from './RsrpIndicator'
import { SeverityBadge } from './SeverityBadge'

export const LogRow = memo(function LogRow({
  log, selected, onSelect,
}) {
  return (
    <div
      role="row"
      tabIndex={0}
      className={`log-row ${selected ? 'is-selected' : ''}`}
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
    </div>
  )
})
