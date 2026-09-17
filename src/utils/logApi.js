const LEVEL_TO_SEVERITY = { D: 'INFO', I: 'INFO', W: 'WARNING', E: 'ERROR' }

export function normalizeApiLogs(logs, initialRsrp = -100) {
  let currentRsrp = initialRsrp
  const normalizedLogs = logs.map((log, index) => {
    const normalized = normalizeApiLog(log, index, currentRsrp)
    currentRsrp = normalized.rsrp
    return normalized
  })
  return { logs: normalizedLogs, lastRsrp: currentRsrp }
}

export function normalizeApiLog(log, index = 0, previousRsrp = -100) {
  const rsrpMatch = log.text?.match(/rsrp=(-?\d+)\s*dBm/i)
  const networkMatch = log.text?.match(/network=(\w+)/i)
  const operator = log.ctx?.operator ?? 'Unknown'
  const timestamp = log.date
  const id = log.id ?? `${timestamp}-${index}-${log.text}`
  const rsrp = rsrpMatch ? Number(rsrpMatch[1]) : previousRsrp
  const metadata = log.metadata ?? {}

  return {
    id,
    timestamp,
    deviceId: metadata.deviceId ?? 'API-DEVICE',
    operator,
    rsrp,
    severity: LEVEL_TO_SEVERITY[log.level] ?? 'INFO',
    message: log.text ?? '',
    context: {
      networkType: networkMatch?.[1] ?? metadata.networkType ?? 'Null',
      cellId: metadata.cellId ?? 'API',
      frequency: metadata.frequency ?? 0,
      latency: metadata.latency ?? 0,
      packetLoss: metadata.packetLoss ?? 0,
      signalQuality: metadata.signalQuality ?? '',
    },
  }
}