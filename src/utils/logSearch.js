export function createSearchText(log) {
  const { context } = log
  return [
    log.message, log.deviceId, log.operator, log.severity,
    context.cellId, context.networkType, context.signalQuality,
    context.frequency, context.latency, context.packetLoss,
  ].join(' ').toLowerCase()
}
