import { CalendarSearch, LocateFixed } from 'lucide-react'
import { useState } from 'react'
import { toUtcDateTimeLocal } from '../../utils/logDateNavigation'

export function DateNavigator({ minTimestamp, maxTimestamp, onNavigate }) {
  const [value, setValue] = useState('')

  const navigate = (nextValue = value) => {
    if (nextValue) onNavigate(nextValue)
  }

  return (
    <label className="date-navigator" title="Jump to the closest log timestamp (UTC)">
      <CalendarSearch size={15} aria-hidden="true" />
      <span className="sr-only">Jump to date and time in UTC</span>
      <input
        type="datetime-local"
        aria-label="Jump to date and time in UTC"
        step="1"
        min={toUtcDateTimeLocal(minTimestamp)}
        max={toUtcDateTimeLocal(maxTimestamp)}
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          navigate(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') navigate()
        }}
      />
      <button type="button" aria-label="Go to selected date" title="Go to closest log" disabled={!value} onClick={() => navigate()}>
        <LocateFixed size={14} />
      </button>
    </label>
  )
}
