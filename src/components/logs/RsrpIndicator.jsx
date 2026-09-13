import { getRsrpBars, getRsrpQuality } from '../../utils/rsrp'

export function RsrpIndicator({ value }) {
  const bars = getRsrpBars(value)
  const quality = getRsrpQuality(value)
  return (
    <span className={`rsrp-indicator rsrp-${quality.toLowerCase().replace(' ', '-')}`} title={`${value} dBm · ${quality} signal`}>
      <span className="signal-bars" aria-hidden="true">
        {[1, 2, 3, 4].map((bar) => <i key={bar} className={bar <= bars ? 'on' : ''} />)}
      </span>
      <span>{value}</span><small>dBm</small>
    </span>
  )
}
