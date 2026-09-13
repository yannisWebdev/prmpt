const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false, timeZone: 'UTC',
})

const fullFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false, timeZone: 'UTC',
})

export function formatLogTime(timestamp) {
  const date = new Date(timestamp)
  return `${timeFormatter.format(date)}.${String(date.getUTCMilliseconds()).padStart(3, '0')}`
}

export function formatShortTime(timestamp) {
  return timeFormatter.format(new Date(timestamp))
}

export function formatFullDate(timestamp) {
  const date = new Date(timestamp)
  return `${fullFormatter.format(date)}.${String(date.getUTCMilliseconds()).padStart(3, '0')} UTC`
}
