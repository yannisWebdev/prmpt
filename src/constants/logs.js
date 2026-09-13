export const OPERATORS = ['Orange', 'SFR', 'Bouygues Telecom', 'Free']
export const SEVERITIES = ['INFO', 'WARNING', 'ERROR']
export const RSRP_QUALITIES = ['Excellent', 'Very Good', 'Good', 'Poor', 'Critical']
export const NETWORK_TYPES = ['5G', '4G', '3G']

export const OPERATOR_COLORS = {
  Orange: '#f59e0b',
  SFR: '#ef4444',
  Free: '#8b5cf6',
  'Bouygues Telecom': '#3b82f6',
}

export const SEVERITY_COLORS = {
  INFO: '#3b82f6',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
}

export const HIGHLIGHT_COLORS = {
  yellow: { label: 'Yellow', light: 'rgba(250, 204, 21, .20)', dark: 'rgba(250, 204, 21, .13)', swatch: '#facc15' },
  green: { label: 'Green', light: 'rgba(74, 222, 128, .18)', dark: 'rgba(74, 222, 128, .12)', swatch: '#4ade80' },
  blue: { label: 'Blue', light: 'rgba(96, 165, 250, .18)', dark: 'rgba(96, 165, 250, .12)', swatch: '#60a5fa' },
  violet: { label: 'Violet', light: 'rgba(167, 139, 250, .18)', dark: 'rgba(167, 139, 250, .12)', swatch: '#a78bfa' },
  pink: { label: 'Pink', light: 'rgba(244, 114, 182, .18)', dark: 'rgba(244, 114, 182, .12)', swatch: '#f472b6' },
  orange: { label: 'Orange', light: 'rgba(251, 146, 60, .20)', dark: 'rgba(251, 146, 60, .13)', swatch: '#fb923c' },
}

export const DEFAULT_FILTERS = {
  query: '',
  operators: [...OPERATORS],
  severities: [...SEVERITIES],
  device: 'ALL',
  rsrpQuality: 'ALL',
}

export const LOG_COUNT = 20000
export const ROW_HEIGHT = 38
