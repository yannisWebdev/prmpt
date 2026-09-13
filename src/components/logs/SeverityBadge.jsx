export function SeverityBadge({ severity }) {
  return (
    <span className={`severity-badge severity-${severity.toLowerCase()}`} title={severity === 'ERROR' ? 'Critical network event' : severity}>
      {severity === 'WARNING' ? 'WARN' : severity}
    </span>
  )
}
