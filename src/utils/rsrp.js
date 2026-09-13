export function getRsrpQuality(rsrp) {
  if (rsrp >= -80) return 'Excellent'
  if (rsrp >= -90) return 'Very Good'
  if (rsrp >= -100) return 'Good'
  if (rsrp >= -110) return 'Poor'
  return 'Critical'
}

export function getRsrpBars(rsrp) {
  if (rsrp >= -80) return 4
  if (rsrp >= -95) return 3
  if (rsrp >= -108) return 2
  return 1
}
