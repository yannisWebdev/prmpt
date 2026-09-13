import { useMemo, useState } from 'react'
import { DEFAULT_FILTERS } from '../constants/logs'
import { createSearchText } from '../utils/logSearch'
import { getRsrpQuality } from '../utils/rsrp'

export function useLogFilters(logs) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const searchableLogs = useMemo(() => logs.map((log) => ({ log, searchText: createSearchText(log) })), [logs])

  const filteredLogs = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    const operatorSet = new Set(filters.operators)
    const severitySet = new Set(filters.severities)

    return searchableLogs
      .filter(({ log, searchText }) => (
        operatorSet.has(log.operator)
        && severitySet.has(log.severity)
        && (filters.device === 'ALL' || log.deviceId === filters.device)
        && (filters.rsrpQuality === 'ALL' || getRsrpQuality(log.rsrp) === filters.rsrpQuality)
        && (!query || searchText.includes(query))
      ))
      .map(({ log }) => log)
  }, [searchableLogs, filters])

  const stats = useMemo(() => filteredLogs.reduce((totals, log) => {
    totals[log.severity.toLowerCase()] += 1
    return totals
  }, { info: 0, warning: 0, error: 0 }), [filteredLogs])

  const clearFilters = () => setFilters({ ...DEFAULT_FILTERS, operators: [...DEFAULT_FILTERS.operators], severities: [...DEFAULT_FILTERS.severities] })

  const hasActiveFilters = filters.query !== ''
    || filters.device !== 'ALL'
    || filters.rsrpQuality !== 'ALL'
    || filters.operators.length !== DEFAULT_FILTERS.operators.length
    || filters.severities.length !== DEFAULT_FILTERS.severities.length

  return { filters, setFilters, filteredLogs, stats, clearFilters, hasActiveFilters }
}
