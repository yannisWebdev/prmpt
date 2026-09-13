import {
  Bookmark, Moon, PanelRightClose, Search, Sun, X,
} from 'lucide-react'
import { OPERATORS, RSRP_QUALITIES, SEVERITIES } from '../../constants/logs'
import { IconButton } from '../ui/IconButton'
import { DateNavigator } from './DateNavigator'
import { MultiSelectFilter } from './MultiSelectFilter'

export function LogToolbar({
  filters, setFilters, devices, total, stats, bookmarkCount, panelOpen,
  onTogglePanel, theme, onToggleTheme, onClearFilters, hasActiveFilters,
  minTimestamp, maxTimestamp, onNavigateToDate,
}) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }))

  return (
    <header className="toolbar">
      <div className="brand-block">
        <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
        <div>
          <h1>Network Log Explorer</h1>
          <p>RADIO TELEMETRY / UTC</p>
        </div>
      </div>

      <div className="toolbar-stats" aria-label="Filtered log statistics">
        <span className="stat-total">{total.toLocaleString()} <small>logs</small></span>
        <span className="stat stat-error"><i />{stats.error.toLocaleString()} <small>errors</small></span>
        <span className="stat stat-warning"><i />{stats.warning.toLocaleString()} <small>warnings</small></span>
        <span className="stat stat-info"><i />{stats.info.toLocaleString()} <small>info</small></span>
      </div>

      <div className="toolbar-controls">
        <label className="search-box">
          <Search size={14} aria-hidden="true" />
          <input
            aria-label="Search logs"
            placeholder="Search logs…"
            value={filters.query}
            onChange={(event) => update('query', event.target.value)}
          />
          {filters.query && (
            <button type="button" onClick={() => update('query', '')} aria-label="Clear search"><X size={12} /></button>
          )}
        </label>

        <DateNavigator
          minTimestamp={minTimestamp}
          maxTimestamp={maxTimestamp}
          onNavigate={onNavigateToDate}
        />

        <MultiSelectFilter label="Operator" options={OPERATORS} selected={filters.operators} onChange={(value) => update('operators', value)} />
        <MultiSelectFilter label="Severity" options={SEVERITIES} selected={filters.severities} onChange={(value) => update('severities', value)} />

        <label className="select-control">
          <span className="sr-only">Device</span>
          <select value={filters.device} onChange={(event) => update('device', event.target.value)} aria-label="Filter by device">
            <option value="ALL">All devices</option>
            {devices.map((device) => <option key={device} value={device}>{device}</option>)}
          </select>
        </label>

        <label className="select-control rsrp-select">
          <span className="sr-only">RSRP quality</span>
          <select value={filters.rsrpQuality} onChange={(event) => update('rsrpQuality', event.target.value)} aria-label="Filter by RSRP quality">
            <option value="ALL">All RSRP</option>
            {RSRP_QUALITIES.map((quality) => <option key={quality} value={quality}>{quality}</option>)}
          </select>
        </label>

        {hasActiveFilters && <button className="clear-filters" type="button" onClick={onClearFilters}><X size={12} /> Clear</button>}
      </div>

      <div className="toolbar-actions">
        <button type="button" className={`bookmark-toggle ${panelOpen ? 'is-active' : ''}`} onClick={onTogglePanel} aria-label="Toggle bookmarks panel">
          <Bookmark size={15} fill={panelOpen ? 'currentColor' : 'none'} />
          <span>{bookmarkCount}</span>
        </button>
        <IconButton label={`Use ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={onToggleTheme}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>
        <IconButton label="Toggle bookmarks panel" onClick={onTogglePanel} active={panelOpen}>
          <PanelRightClose size={16} />
        </IconButton>
      </div>
    </header>
  )
}
