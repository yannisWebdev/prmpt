import { ChevronDown } from 'lucide-react'

export function MultiSelectFilter({ label, options, selected, onChange, counts = {} }) {
  const toggle = (option) => {
    onChange(selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option])
  }

  return (
    <details className="filter-menu">
      <summary>
        <span>{label}</span>
        {selected.length !== options.length && <span className="filter-count">{selected.length}</span>}
        <ChevronDown size={13} aria-hidden="true" />
      </summary>
      <div className="filter-popover">
        <div className="filter-popover-title">Filter by {label.toLowerCase()}</div>
        {options.map((option) => (
          <label key={option} className="filter-option">
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
            />
            <span>{option === 'WARNING' ? 'WARN' : option}</span>
            {counts[option] !== undefined && <span className="option-count">{counts[option].toLocaleString()}</span>}
          </label>
        ))}
      </div>
    </details>
  )
}
