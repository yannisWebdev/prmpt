export function toUtcDateTimeLocal(timestamp) {
  return timestamp ? new Date(timestamp).toISOString().slice(0, 19) : ''
}

export function parseUtcDateTimeLocal(value) {
  if (!value) return Number.NaN
  return Date.parse(`${value}Z`)
}

export function findClosestLogIndex(logs, targetTimestamp) {
  if (!logs.length || !Number.isFinite(targetTimestamp)) return -1

  let low = 0
  let high = logs.length
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if (Date.parse(logs[middle].timestamp) < targetTimestamp) low = middle + 1
    else high = middle
  }

  if (low === 0) return 0
  if (low === logs.length) return logs.length - 1

  const beforeDifference = targetTimestamp - Date.parse(logs[low - 1].timestamp)
  const afterDifference = Date.parse(logs[low].timestamp) - targetTimestamp
  return beforeDifference <= afterDifference ? low - 1 : low
}
