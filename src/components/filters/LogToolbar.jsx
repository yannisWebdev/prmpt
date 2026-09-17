import { CalendarSearch } from 'lucide-react'

export function LogToolbar({
  minTimestamp, maxTimestamp, onNavigateToDate,
}) {
  return (
    <div className="search-toolbar">
      <div className="toolbar-controls">
        <label className="search-box">
          <CalendarSearch size={14} aria-hidden="true" />
          <input
            aria-label="Search logs by date"
            placeholder="Jump to date and time..."
            type="datetime-local"
            min={minTimestamp ? new Date(minTimestamp).toISOString().slice(0, 19) : undefined}
            max={maxTimestamp ? new Date(maxTimestamp).toISOString().slice(0, 19) : undefined}
            onChange={(event) => onNavigateToDate(event.target.value)}
          />
        </label>
      </div>
    </div>
  )
}
