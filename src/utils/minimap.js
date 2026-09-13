export function createMinimapBuckets(logs, bucketCount) {
  if (!logs.length || bucketCount <= 0) return []
  const count = Math.min(Math.floor(bucketCount), logs.length)
  const buckets = []

  for (let bucketIndex = 0; bucketIndex < count; bucketIndex += 1) {
    const startIndex = Math.floor((bucketIndex * logs.length) / count)
    const endIndex = Math.max(startIndex, Math.floor(((bucketIndex + 1) * logs.length) / count) - 1)
    const totals = { INFO: 0, WARNING: 0, ERROR: 0 }

    for (let index = startIndex; index <= endIndex; index += 1) {
      totals[logs[index].severity] += 1
    }

    const dominantSeverity = totals.ERROR > 0
      ? 'ERROR'
      : totals.WARNING > 0
        ? 'WARNING'
        : 'INFO'

    buckets.push({
      startIndex,
      endIndex,
      info: totals.INFO,
      warning: totals.WARNING,
      error: totals.ERROR,
      dominantSeverity,
      startTimestamp: logs[startIndex].timestamp,
      endTimestamp: logs[endIndex].timestamp,
    })
  }

  return buckets
}
