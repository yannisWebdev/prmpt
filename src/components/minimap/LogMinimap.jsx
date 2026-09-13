import { useEffect, useMemo, useRef, useState } from 'react'
import { SEVERITY_COLORS } from '../../constants/logs'
import { formatShortTime } from '../../utils/formatDate'
import { createMinimapBuckets } from '../../utils/minimap'

export function LogMinimap({ logs, visibleRange, onNavigate }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const [height, setHeight] = useState(600)
  const [hoveredBucket, setHoveredBucket] = useState(null)
  const buckets = useMemo(() => createMinimapBuckets(logs, Math.max(1, Math.floor(height))), [logs, height])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return undefined
    const observer = new ResizeObserver(([entry]) => setHeight(Math.max(1, entry.contentRect.height)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const width = container.clientWidth
    const ratio = window.devicePixelRatio || 1
    canvas.width = width * ratio
    canvas.height = height * ratio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const context = canvas.getContext('2d')
    context.scale(ratio, ratio)
    context.clearRect(0, 0, width, height)
    if (!buckets.length) return
    const bucketHeight = height / buckets.length

    buckets.forEach((bucket, index) => {
      const total = bucket.info + bucket.warning + bucket.error
      const severity = bucket.dominantSeverity
      const share = severity === 'ERROR' ? bucket.error / total : severity === 'WARNING' ? bucket.warning / total : bucket.info / total
      context.globalAlpha = 0.42 + Math.min(0.55, share * 0.55)
      context.fillStyle = SEVERITY_COLORS[severity]
      const markerWidth = severity === 'ERROR' ? width - 8 : severity === 'WARNING' ? Math.max(8, width * 0.56) : Math.max(5, width * 0.32)
      context.fillRect(width - markerWidth - 4, index * bucketHeight, markerWidth, Math.max(1.1, bucketHeight))
    })
    context.globalAlpha = 1
  }, [buckets, height])

  const getBucketFromEvent = (event) => {
    if (!buckets.length) return null
    const rect = event.currentTarget.getBoundingClientRect()
    const y = Math.max(0, Math.min(rect.height - 1, event.clientY - rect.top))
    const bucketIndex = Math.min(buckets.length - 1, Math.floor((y / rect.height) * buckets.length))
    return { bucket: buckets[bucketIndex], y }
  }

  const viewportTop = logs.length ? (visibleRange.start / logs.length) * 100 : 0
  const viewportHeight = logs.length ? Math.max(1.4, ((visibleRange.end - visibleRange.start + 1) / logs.length) * 100) : 0

  return (
    <aside className="minimap" aria-label="Log event minimap">
      <div className="minimap-header"><span>OVERVIEW</span><span>{logs.length.toLocaleString()}</span></div>
      <div
        ref={containerRef}
        className="minimap-track"
        role="scrollbar"
        aria-label="Navigate log timeline"
        aria-valuemin={0}
        aria-valuemax={Math.max(0, logs.length - 1)}
        aria-valuenow={visibleRange.start}
        tabIndex={0}
        onMouseMove={(event) => setHoveredBucket(getBucketFromEvent(event))}
        onMouseLeave={() => setHoveredBucket(null)}
        onClick={(event) => {
          const result = getBucketFromEvent(event)
          if (result) onNavigate(result.bucket.startIndex)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Home') onNavigate(0)
          if (event.key === 'End') onNavigate(Math.max(0, logs.length - 1))
        }}
      >
        <canvas ref={canvasRef} />
        <div className="minimap-viewport" style={{ top: `${viewportTop}%`, height: `${viewportHeight}%` }} />
        {hoveredBucket && (
          <div className="minimap-tooltip" style={{ top: Math.min(height - 118, Math.max(4, hoveredBucket.y - 48)) }}>
            <strong>{formatShortTime(hoveredBucket.bucket.startTimestamp)} → {formatShortTime(hoveredBucket.bucket.endTimestamp)}</strong>
            <span>{hoveredBucket.bucket.info + hoveredBucket.bucket.warning + hoveredBucket.bucket.error} logs</span>
            <i className="tooltip-info">{hoveredBucket.bucket.info} INFO</i>
            <i className="tooltip-warning">{hoveredBucket.bucket.warning} WARN</i>
            <i className="tooltip-error">{hoveredBucket.bucket.error} ERROR</i>
          </div>
        )}
      </div>
      <div className="minimap-legend"><i className="info" /><i className="warning" /><i className="error" /></div>
    </aside>
  )
}
